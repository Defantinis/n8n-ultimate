/**
 * Community Node Validation Framework Test Suite
 * Comprehensive tests for validating community-developed n8n nodes
 */

import { CommunityNodeValidator, CommunityValidationResult, ValidationOptions } from './community-node-validator';
import { CommunityNodeDefinition, CommunityNodePackage } from './community-node-registry';

/**
 * Test Data Generator for Community Node Validation Tests
 */
export class CommunityNodeValidatorTestData {
  
  /**
   * Generate a complete community node package for testing
   */
  static generateCommunityNodePackage(overrides: Partial<CommunityNodePackage> = {}): CommunityNodePackage {
    return {
      name: '@test/test-node',
      version: '1.0.0',
      description: 'Test community node for validation',
      keywords: ['n8n-nodes-base', 'n8n-community-node-test'],
      author: 'Test Author',
      main: 'dist/index.js',
      n8n: {
        nodes: ['dist/TestNode.node.js'],
        credentials: ['dist/credentials/TestCredentials.credentials.js']
      },
      dependencies: {
        'n8n-workflow': '^1.0.0'
      },
      repository: {
        type: 'git',
        url: 'https://github.com/test/test-node.git'
      },
      license: 'MIT',
      publishedAt: new Date('2024-01-15'),
      lastUpdated: new Date('2024-01-15'),
      downloadCount: 1500,
      popularity: 85,
      ...overrides
    };
  }

  /**
   * Generate a community node definition for testing
   */
  static generateCommunityNodeDefinition(overrides: Partial<CommunityNodeDefinition> = {}): CommunityNodeDefinition {
    return {
      name: 'TestNode',
      displayName: 'Test Node',
      description: 'A test node for community validation',
      version: '1.0.0',
      packageName: '@test/test-node',
      category: 'Communication',
      inputs: [
        {
          displayName: 'Main',
          name: 'main',
          type: 'main',
          required: true
        }
      ],
      outputs: [
        {
          displayName: 'Main',
          name: 'main',
          type: 'main'
        }
      ],
      properties: [
        {
          displayName: 'API Key',
          name: 'apiKey',
          type: 'string',
          required: true,
          default: '',
          description: 'API key for authentication'
        },
        {
          displayName: 'Operation',
          name: 'operation',
          type: 'options',
          required: true,
          default: 'get',
          options: [
            {
              name: 'Get',
              value: 'get'
            },
            {
              name: 'Create',
              value: 'create'
            }
          ]
        }
      ],
      credentials: ['testCredentials'],
      ...overrides
    };
  }

  /**
   * Generate validation options for testing
   */
  static generateValidationOptions(overrides: Partial<ValidationOptions> = {}): ValidationOptions {
    return {
      includePerformanceValidation: true,
      includeSecurityValidation: true,
      includeCompatibilityValidation: true,
      strictMode: false,
      n8nVersion: '1.0.0',
      skipWarnings: false,
      maxValidationTime: 30000,
      ...overrides
    };
  }
}

/**
 * Comprehensive Test Suite for Community Node Validator
 */
export class CommunityNodeValidatorTestSuite {
  private validator: CommunityNodeValidator;

  constructor() {
    this.validator = new CommunityNodeValidator();
  }

  /**
   * Run all validation tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Community Node Validator Test Suite...\n');

    try {
      await this.testBasicValidation();
      await this.testValidationOptions();
      await this.testCaching();

      console.log('✅ All Community Node Validator tests completed successfully!\n');

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    }
  }

  /**
   * Test basic validation functionality
   */
  private async testBasicValidation(): Promise<void> {
    console.log('📋 Testing Basic Validation...');

    const nodePackage = CommunityNodeValidatorTestData.generateCommunityNodePackage();
    const nodeDefinition = CommunityNodeValidatorTestData.generateCommunityNodeDefinition();
    const options = CommunityNodeValidatorTestData.generateValidationOptions();

    const result = await this.validator.validateCommunityNode(nodeDefinition, nodePackage, options);

    // Validate result structure
    this.assert(typeof result.isValid === 'boolean', 'Result should have isValid boolean');
    this.assert(typeof result.score === 'number', 'Result should have numeric score');
    this.assert(['A', 'B', 'C', 'D', 'F'].includes(result.grade), 'Result should have valid grade');
    this.assert(Array.isArray(result.errors), 'Result should have errors array');
    this.assert(Array.isArray(result.warnings), 'Result should have warnings array');
    this.assert(Array.isArray(result.recommendations), 'Result should have recommendations array');

    console.log(`   ✅ Basic validation passed - Score: ${result.score}, Grade: ${result.grade}`);
  }

  /**
   * Test validation options
   */
  private async testValidationOptions(): Promise<void> {
    console.log('📋 Testing Validation Options...');

    const nodePackage = CommunityNodeValidatorTestData.generateCommunityNodePackage();
    const nodeDefinition = CommunityNodeValidatorTestData.generateCommunityNodeDefinition();

    // Test with warnings skipped
    const result = await this.validator.validateCommunityNode(nodeDefinition, nodePackage, {
      skipWarnings: true
    });

    // Validate options effects
    this.assert(result.warnings.length === 0, 'Should skip warnings when requested');

    console.log(`   ✅ Validation options test completed`);
  }

  /**
   * Test caching functionality
   */
  private async testCaching(): Promise<void> {
    console.log('📋 Testing Caching Functionality...');

    const nodePackage = CommunityNodeValidatorTestData.generateCommunityNodePackage();
    const nodeDefinition = CommunityNodeValidatorTestData.generateCommunityNodeDefinition();

    // Clear cache first
    this.validator.clearCache();
    let cacheStats = this.validator.getCacheStats();
    this.assert(cacheStats.size === 0, 'Cache should be empty initially');

    // First validation - should cache result
    const result1 = await this.validator.validateCommunityNode(nodeDefinition, nodePackage);

    cacheStats = this.validator.getCacheStats();
    this.assert(cacheStats.size === 1, 'Cache should have one entry after first validation');

    // Second validation - should use cache
    const result2 = await this.validator.validateCommunityNode(nodeDefinition, nodePackage);

    // Cached result should be identical
    this.assert(result1.score === result2.score, 'Cached result should have same score');
    this.assert(result1.grade === result2.grade, 'Cached result should have same grade');

    console.log(`   ✅ Caching test completed`);
  }

  /**
   * Helper method for assertions
   */
  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }
}

/**
 * Main test execution function
 */
export async function runCommunityNodeValidatorTests(): Promise<void> {
  const testSuite = new CommunityNodeValidatorTestSuite();
  await testSuite.runAllTests();
}

// Run tests if this file is executed directly
if (require.main === module) {
  runCommunityNodeValidatorTests()
    .then(() => {
      console.log('🎉 All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Tests failed:', error);
      process.exit(1);
    });
} 