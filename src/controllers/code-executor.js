const { CodeExecutor } = require('code-executor');

const codeExecutor = new CodeExecutor('myExecutor', process.env.REDIS_URL);

const executeCode = async (language, code, testCases) => {
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
