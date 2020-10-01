import CodeExecutor from 'code-executor';

const codeExecutor = new CodeExecutor('myExecutor', 'redis://127.0.0.1:6379');

const executeCode = async (language, code, testCases) => {
    console.log('Language', language);
    const input = {
        language,
        code,
        testCases,
        timeout: 2,
    };

    const results = await codeExecutor.runCode(input);
    return results;
};

module.exports = executeCode;
