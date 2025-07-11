#!/usr/bin/env node

/**
 * Script to add MCP Configuration to MongoDB
 * This script reads the mcp-config.yaml file and stores it in MongoDB
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection setup
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.error('Please check your .env.local file');
  process.exit(1);
}

// Import the MCPConfig model (we'll use a simplified version for this script)
const MCPConfigSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  version: { type: String, required: true },
  description: { type: String },
  config_data: { type: Object, required: true }, // Store the entire config as JSON
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: { type: String },
  is_active: { type: Boolean, default: true },
});

const MCPConfig = mongoose.model('MCPConfig', MCPConfigSchema);

/**
 * Parse YAML configuration file
 */
function parseYAMLConfig(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContent);
  } catch (error) {
    console.error(`❌ Error parsing YAML file: ${error.message}`);
    throw error;
  }
}

/**
 * Transform YAML config to MongoDB document structure
 */
function transformConfigForMongoDB(yamlConfig) {
  // Extract client configurations
  const clients = [];

  // Process each client (claude, cursor, etc.)
  Object.keys(yamlConfig).forEach(clientName => {
    if (
      clientName === 'settings' ||
      clientName === 'tools' ||
      clientName === 'environments'
    ) {
      return; // Skip global settings
    }

    const clientConfig = yamlConfig[clientName];
    if (typeof clientConfig === 'object' && clientConfig !== null) {
      const servers = [];

      // Process each server under the client
      Object.keys(clientConfig).forEach(serverName => {
        const serverConfig = clientConfig[serverName];
        if (typeof serverConfig === 'object') {
          servers.push({
            name: serverName,
            command: serverConfig.command || 'node',
            args: serverConfig.args || [],
            env: serverConfig.env || {},
            guardrails: serverConfig.guardrails || {
              secrets: 'block',
              custom_guardrails: [],
            },
          });
        }
      });

      clients.push({
        name: clientName,
        servers: servers,
      });
    }
  });

  return {
    name: 'traxplaya-mcp-config',
    version: yamlConfig.settings?.version || '1.0.0',
    description:
      'MCP Configuration for #TraxPlaya Application with Security Guardrails',
    clients: clients,
    settings: yamlConfig.settings || {},
    tools: yamlConfig.tools || [],
    environments: yamlConfig.environments || [],
    created_by: 'system',
    is_active: true,
    config_data: yamlConfig, // Store the entire original config
  };
}

/**
 * Save configuration to MongoDB
 */
async function saveConfigToMongoDB(configData) {
  try {
    // Check if a config with the same name already exists
    const existingConfig = await MCPConfig.findOne({ name: configData.name });

    if (existingConfig) {
      console.log(`📝 Updating existing MCP configuration: ${configData.name}`);

      // Update the existing config
      existingConfig.version = configData.version;
      existingConfig.description = configData.description;
      existingConfig.clients = configData.clients;
      existingConfig.settings = configData.settings;
      existingConfig.tools = configData.tools;
      existingConfig.environments = configData.environments;
      existingConfig.config_data = configData.config_data;
      existingConfig.updated_at = new Date();

      await existingConfig.save();
      console.log(`✅ Updated MCP configuration successfully`);
      return existingConfig;
    } else {
      console.log(`📝 Creating new MCP configuration: ${configData.name}`);

      // Create new config
      const newConfig = new MCPConfig(configData);
      await newConfig.save();
      console.log(`✅ Created MCP configuration successfully`);
      return newConfig;
    }
  } catch (error) {
    console.error(`❌ Error saving to MongoDB: ${error.message}`);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting MCP Configuration import to MongoDB...');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Parse the YAML configuration
    const yamlConfigPath = path.join(__dirname, '..', 'mcp-config.yaml');
    console.log(`📖 Reading configuration from: ${yamlConfigPath}`);

    if (!fs.existsSync(yamlConfigPath)) {
      throw new Error(`Configuration file not found: ${yamlConfigPath}`);
    }

    const yamlConfig = parseYAMLConfig(yamlConfigPath);
    console.log('✅ YAML configuration parsed successfully');

    // Transform for MongoDB
    const mongoConfig = transformConfigForMongoDB(yamlConfig);
    console.log('✅ Configuration transformed for MongoDB');

    // Save to MongoDB
    const savedConfig = await saveConfigToMongoDB(mongoConfig);

    // Display summary
    console.log('\n📊 Configuration Summary:');
    console.log(`   Name: ${savedConfig.name}`);
    console.log(`   Version: ${savedConfig.version}`);
    console.log(`   Clients: ${savedConfig.clients.length}`);
    console.log(`   Tools: ${savedConfig.tools.length}`);
    console.log(`   Environments: ${savedConfig.environments.length}`);
    console.log(`   Created: ${savedConfig.created_at}`);
    console.log(`   Updated: ${savedConfig.updated_at}`);
    console.log(`   Active: ${savedConfig.is_active}`);

    // Show client details
    console.log('\n👥 Client Configurations:');
    savedConfig.clients.forEach(client => {
      console.log(`   📱 ${client.name}:`);
      client.servers.forEach(server => {
        console.log(`      🖥️  ${server.name}`);
        console.log(
          `         Command: ${server.command} ${server.args.join(' ')}`
        );
        console.log(
          `         Guardrails: ${server.guardrails.custom_guardrails.length} custom rules`
        );
      });
    });

    console.log('\n🎉 MCP Configuration successfully added to MongoDB!');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  main,
  parseYAMLConfig,
  transformConfigForMongoDB,
  saveConfigToMongoDB,
};
