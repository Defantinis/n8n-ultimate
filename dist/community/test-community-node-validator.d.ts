/**
 * Community Node Validation Framework Test Suite
 * Comprehensive tests for validating community-developed n8n nodes
 */
import { ValidationOptions } from './community-node-validator';
import { CommunityNodeDefinition, CommunityNodePackage } from './community-node-registry';
/**
 * Test Data Generator for Community Node Validation Tests
 */
export declare class CommunityNodeValidatorTestData {
    /**
     * Generate a complete community node package for testing
     */
    static generateCommunityNodePackage(overrides?: Partial<CommunityNodePackage>): CommunityNodePackage;
    /**
     * Generate a community node definition for testing
     */
    static generateCommunityNodeDefinition(overrides?: Partial<CommunityNodeDefinition>): CommunityNodeDefinition;
    /**
     * Generate validation options for testing
     */
    static generateValidationOptions(overrides?: Partial<ValidationOptions>): ValidationOptions;
}
/**
 * Comprehensive Test Suite for Community Node Validator
 */
export declare class CommunityNodeValidatorTestSuite {
    private validator;
    constructor();
    /**
     * Run all validation tests
     */
    runAllTests(): Promise<void>;
    /**
     * Test basic validation functionality
     */
    private testBasicValidation;
    /**
     * Test validation options
     */
    private testValidationOptions;
    /**
     * Test caching functionality
     */
    private testCaching;
    /**
     * Helper method for assertions
     */
    private assert;
}
/**
 * Main test execution function
 */
export declare function runCommunityNodeValidatorTests(): Promise<void>;
//# sourceMappingURL=test-community-node-validator.d.ts.map