#!/usr/bin/env node
/**
 * mcp-nuxt.js - MCP client for Nuxt and Nuxt UI documentation servers
 * 
 * Usage:
 *   node mcp-nuxt.js list-pages           List all documentation pages
 *   node mcp-nuxt.js get-page <path>      Get a specific documentation page
 *   node mcp-nuxt.js search <topic>       Search documentation by topic
 *   node mcp-nuxt.js blog                 List all blog posts
 *   node mcp-nuxt.js deploy               List deployment providers
 * 
 * With options:
 *   --server=<url>    MCP server URL (default: https://nuxt.com/mcp)
 *   --version=<ver>   Nuxt version for list-pages (3.x, 4.x, or all)
 *   --sections=<s>    Page sections to fetch (comma-separated)
 * 
 * Examples:
 *   node mcp-nuxt.js list-pages --version=4.x
 *   node mcp-nuxt.js get-page getting-started/introduction --server=https://nuxt.com/mcp
 *   node mcp-nuxt.js search composables --server=https://nuxt.com/mcp
 *   node mcp-nuxt.js list-components --server=https://ui.nuxt.com/mcp
 *   node mcp-nuxt.js get-component button --server=https://ui.nuxt.com/mcp
 */

const DEFAULT_NUXT_SERVER = 'https://nuxt.com/mcp';
const DEFAULT_NUXT_UI_SERVER = 'https://ui.nuxt.com/mcp';
const PROTOCOL_VERSION = '2025-06-18';

class MCPClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.sessionId = null;
    this.initialized = false;
  }

  async request(method, params = {}) {
    const id = Date.now();

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'MCP-Protocol-Version': PROTOCOL_VERSION,
    };

    if (this.sessionId) {
      headers['Mcp-Session-Id'] = this.sessionId;
    }

    const response = await fetch(this.serverUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params,
      }),
    });

    // Check for session ID in response
    const mcpSessionId = response.headers.get('Mcp-Session-Id');
    if (mcpSessionId) {
      this.sessionId = mcpSessionId;
    }

    // Handle 202 Accepted (for notifications/responses without body)
    if (response.status === 202) {
      return null;
    }

    const contentType = response.headers.get('Content-Type');

    // SSE stream response (for tools that stream)
    if (contentType && contentType.includes('text/event-stream')) {
      return await this.handleSSEStream(response);
    }

    // JSON response
    const data = await response.json();

    if (data.error) {
      throw new Error(`MCP error: ${data.error.code} - ${data.error.message}`);
    }

    return data.result;
  }

  async handleSSEStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let result = null;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return result;
          }
          try {
            const parsed = JSON.parse(data);
            // Collect JSON-RPC responses
            if (parsed.id !== undefined) {
              result = parsed;
            }
          } catch (e) {
            // Skip non-JSON data
          }
        }
      }
    }

    return result;
  }

  async initialize() {
    const result = await this.request('initialize', {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: {
        name: 'mcp-nuxt-cli',
        version: '1.0.0',
      },
    });
    this.initialized = true;
    return result;
  }

  async listTools() {
    return await this.request('tools/list');
  }

  async callTool(name, args = {}) {
    return await this.request('tools/call', { name, arguments: args });
  }

  // Convenience methods for Nuxt MCP

  async listDocumentationPages(version = 'all') {
    return await this.callTool('list-documentation-pages', { version });
  }

  async getDocumentationPage(path, version = '4.x', sections = null) {
    const args = { path, version };
    if (sections) {
      args.sections = Array.isArray(sections) ? sections : sections.split(',');
    }
    return await this.callTool('get-documentation-page', args);
  }

  async getGettingStartedGuide(version = '4.x') {
    return await this.callTool('get-getting-started-guide', { version });
  }

  async findDocumentationForTopic(topic) {
    return await this.callTool('find-documentation-for-topic', { topic });
  }

  async listBlogPosts() {
    return await this.callTool('list-blog-posts');
  }

  async getBlogPost(path) {
    return await this.callTool('get-blog-post', { path });
  }

  async listDeployProviders() {
    return await this.callTool('list-deploy-providers');
  }

  async getDeployProvider(path) {
    return await this.callTool('get-deploy-provider', { path });
  }

  async getMigrationHelp(fromVersion, toVersion) {
    return await this.callTool('migration-help', { fromVersion, toVersion });
  }

  // Convenience methods for Nuxt UI MCP

  async listComponents() {
    return await this.callTool('list-components');
  }

  async getComponent(name, sections = null) {
    const args = { componentName: name };
    if (sections) {
      args.sections = Array.isArray(sections) ? sections : sections.split(',');
    }
    return await this.callTool('get-component', args);
  }

  async getComponentMetadata(name) {
    return await this.callTool('get-component-metadata', { componentName: name });
  }

  async searchComponents(query) {
    return await this.callTool('search-components-by-category', { search: query });
  }

  async listComposables() {
    return await this.callTool('list-composables');
  }

  async listTemplates() {
    return await this.callTool('list-templates');
  }

  async getTemplate(name) {
    return await this.callTool('get-template', { templateName: name });
  }

  async listExamples() {
    return await this.callTool('list-examples');
  }

  async getExample(name) {
    return await this.callTool('get-example', { exampleName: name });
  }

  async listDocumentationPagesUI() {
    return await this.callTool('list-documentation-pages');
  }

  async getDocumentationPageUI(path, sections = null) {
    const args = { path };
    if (sections) {
      args.sections = Array.isArray(sections) ? sections : sections.split(',');
    }
    return await this.callTool('get-documentation-page', args);
  }

  async listGettingStartedGuides() {
    return await this.callTool('list-getting-started-guides');
  }

  async getMigrationGuide(version) {
    return await this.callTool('get-migration-guide', { version });
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const flags = args.filter(a => a.startsWith('--'));
  const commands = args.filter(a => !a.startsWith('--'));

  const getFlag = (name, defaultVal = null) => {
    const flag = flags.find(f => f.startsWith(`--${name}=`));
    return flag ? flag.split('=').slice(1).join('=') : defaultVal;
  };

  const server = getFlag('server', DEFAULT_NUXT_SERVER);
  const version = getFlag('version', 'all');
  const sections = getFlag('sections', null);

  const [command, ...commandArgs] = commands;

  if (!command) {
    console.log(`
mcp-nuxt.js - MCP client for Nuxt and Nuxt UI documentation

Usage:
  node mcp-nuxt.js <command> [options]

Commands (Nuxt MCP - https://nuxt.com/mcp):
  list-pages              List all documentation pages
  get-page <path>         Get a specific documentation page
  search <topic>          Search documentation by topic
  blog                    List all blog posts
  get-blog <path>         Get a blog post
  deploy                  List deployment providers
  get-deploy <path>       Get deployment provider details
  migration <from> <to>   Get migration help between versions
  getting-started         Get getting started guide

Commands (Nuxt UI MCP - https://ui.nuxt.com/mcp):
  list-components         List all Nuxt UI components
  get-component <name>   Get component documentation
  component-meta <name>   Get component metadata (props, slots, events)
  search-components <q>   Search components
  list-composables        List all composables
  list-templates          List all templates
  get-template <name>     Get template details
  list-examples           List all examples
  get-example <name>      Get example code
  ui-docs                 List documentation pages
  ui-doc <path>           Get documentation page
  getting-started-ui      List getting started guides
  migration-guide <ver>   Get migration guide

Options:
  --server=<url>          MCP server URL (default: ${DEFAULT_NUXT_SERVER})
  --version=<ver>         Nuxt version: 3.x, 4.x, or all (for list-pages)
  --sections=<s>          Page sections to fetch (comma-separated)

Examples:
  node mcp-nuxt.js list-pages
  node mcp-nuxt.js list-pages --version=4.x
  node mcp-nuxt.js get-page getting-started/introduction
  node mcp-nuxt.js search composables
  node mcp-nuxt.js blog
  node mcp-nuxt.js deploy
  node mcp-nuxt.js list-components --server=${DEFAULT_NUXT_UI_SERVER}
  node mcp-nuxt.js get-component button --server=${DEFAULT_NUXT_UI_SERVER}
  node mcp-nuxt.js get-component button --sections=usage,api --server=${DEFAULT_NUXT_UI_SERVER}
`);
    process.exit(0);
  }

  const client = new MCPClient(server);

  try {
    // Initialize connection
    await client.initialize();

    let result;

    switch (command) {
      // Nuxt MCP commands
      case 'list-pages':
        result = await client.listDocumentationPages(version);
        break;
      case 'get-page':
        if (!commandArgs[0]) throw new Error('Path required: get-page <path>');
        result = await client.getDocumentationPage(commandArgs[0], version, sections);
        break;
      case 'search':
        if (!commandArgs[0]) throw new Error('Topic required: search <topic>');
        result = await client.findDocumentationForTopic(commandArgs.join(' '));
        break;
      case 'blog':
        result = await client.listBlogPosts();
        break;
      case 'get-blog':
        if (!commandArgs[0]) throw new Error('Path required: get-blog <path>');
        result = await client.getBlogPost(commandArgs[0]);
        break;
      case 'deploy':
        result = await client.listDeployProviders();
        break;
      case 'get-deploy':
        if (!commandArgs[0]) throw new Error('Path required: get-deploy <path>');
        result = await client.getDeployProvider(commandArgs[0]);
        break;
      case 'migration':
        if (!commandArgs[0] || !commandArgs[1]) throw new Error('Versions required: migration <from> <to>');
        result = await client.getMigrationHelp(commandArgs[0], commandArgs[1]);
        break;
      case 'getting-started':
        result = await client.getGettingStartedGuide(version === 'all' ? '4.x' : version);
        break;

      // Nuxt UI MCP commands
      case 'list-components':
        result = await client.listComponents();
        break;
      case 'get-component':
        if (!commandArgs[0]) throw new Error('Component name required: get-component <name>');
        result = await client.getComponent(commandArgs[0], sections);
        break;
      case 'component-meta':
        if (!commandArgs[0]) throw new Error('Component name required: component-meta <name>');
        result = await client.getComponentMetadata(commandArgs[0]);
        break;
      case 'search-components':
        if (!commandArgs[0]) throw new Error('Query required: search-components <query>');
        result = await client.searchComponents(commandArgs.join(' '));
        break;
      case 'list-composables':
        result = await client.listComposables();
        break;
      case 'list-templates':
        result = await client.listTemplates();
        break;
      case 'get-template':
        if (!commandArgs[0]) throw new Error('Template name required: get-template <name>');
        result = await client.getTemplate(commandArgs[0]);
        break;
      case 'list-examples':
        result = await client.listExamples();
        break;
      case 'get-example':
        if (!commandArgs[0]) throw new Error('Example name required: get-example <name>');
        result = await client.getExample(commandArgs[0]);
        break;
      case 'ui-docs':
        result = await client.listDocumentationPagesUI();
        break;
      case 'ui-doc':
        if (!commandArgs[0]) throw new Error('Path required: ui-doc <path>');
        result = await client.getDocumentationPageUI(commandArgs[0], sections);
        break;
      case 'getting-started-ui':
        result = await client.listGettingStartedGuides();
        break;
      case 'migration-guide':
        if (!commandArgs[0]) throw new Error('Version required: migration-guide <version>');
        result = await client.getMigrationGuide(commandArgs[0]);
        break;

      // Utility commands
      case 'tools':
        result = await client.listTools();
        break;
      case 'init':
        result = await client.initialize();
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.error('Run without arguments to see help');
        process.exit(1);
    }

    // Format and output result
    if (result === null || result === undefined) {
      console.log('OK');
    } else if (typeof result === 'string') {
      console.log(result);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
