interface TestResult {
    testName: string;
    passed: boolean;
    error?: string | undefined;
    details?: any;
}
declare class DocumentationResourcesTests {
    private results;
    runAllTests(): Promise<TestResult[]>;
    private testDocumentationManager;
    private testResourceSearch;
    private testNodeDocumentation;
    private testBestPracticesRetrieval;
    private testCommunityResourcesRetrieval;
    private testWorkflowDocumentationGeneration;
    private testProjectDocumentationGeneration;
    private testReadmeGeneration;
    private testResourceFetcher;
    private testDocumentationManagerIntegration;
    private testComplexityAssessment;
    private testResourceCategorization;
    private testResourceValidation;
    private testDocumentationUtilities;
    private addResult;
    private printResults;
}
export declare const runDocumentationResourcesTests: () => Promise<TestResult[]>;
export default DocumentationResourcesTests;
//# sourceMappingURL=test-documentation-resources.d.ts.map