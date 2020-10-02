import { CodeExecutor } from 'code-executor';

const codeExecutor = new CodeExecutor('myExecutor', process.env.REDIS_URL);

const executeCode = async (language, code, testCases) => {
    console.log('Language:\n', language);
    console.log('\n\n');
    console.log('Code:\n', code);
    console.log('\n\n');
    console.log('Test Cases:\n', testCases[0], testCases[1]);
    console.log('\n\n');
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
