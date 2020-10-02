import { CodeExecutor } from 'code-executor';

const codeExecutor = new CodeExecutor('myExecutor', process.env.REDIS_URL);

const executeCode = async (language, code, testCases) => {
    const input = {
        language,
        code,
        testCases,
        timeout: 2,
    };

    const results = await codeExecutor.runCode(input);
    console.log('RESULTS: ', results);
    return results;
};

module.exports = executeCode;
