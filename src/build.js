const core = require('@actions/core');
const exec = require('@actions/exec');
const io = require('@actions/io');
const path = require('path');

async function run() {
    try {
        const unityPath = core.getInput('unity-path') || process.env.UNITY_PATH;
        if (!unityPath) {
            throw new Error('unity path not found');
        }
        const projectPath = core.getInput('project-path');
        const buildTatget = core.getInput('build-target', { required: true });
        const buildPath = core.getInput('build-path') || path.join('./builds', buildTatget);
        const buildVersion = core.getInput('build-version');
        const buildNumber = core.getInput('build-number');
        const buildDefines = core.getInput('build-defines');
        const buildOptions = core.getInput('build-options');
        
        const unityUsername = core.getInput('unity-username');
        const unityPassword = core.getInput('unity-password');
        const unitySerial = core.getInput('unity-serial');
        
        let buildMethod = core.getInput('build-method');
        let runTests = core.getInput('run-tests');
        const buildMethodArgs = core.getInput('build-method-args');
        const noGraphics = core.getInput('no-graphics') !== 'false';

        if (!runTests) {
            if (!buildMethod) {
                throw new Error('build method not found! Set [run-tests] or [build-method].');
            }
        }

        let unityCmd = '';
        if (process.platform === 'linux') {
            unityCmd = `xvfb-run --auto-servernum "${unityPath}"`;
        } else {
            unityCmd = `"${unityPath}"`;
        }

        let buildArgs = '';
        buildArgs += ` -projectPath "${projectPath}"`;
        if (!runTests) {
            buildArgs += ` -buildTarget "${buildTatget}"`;
            buildArgs += ` -buildPath "${buildPath}"`;
            buildArgs += ` -executeMethod "${buildMethod}"`;
        }

        buildArgs += ` ${buildMethodArgs}`;
        
        if (unitySerial) {
            buildArgs += ` -serial "${unitySerial}"`;
        }
        if (unityUsername) {
            buildArgs += ` -username "${unityUsername}"`;
        }
        if (unityPassword) {
            buildArgs += ` -password "${unityPassword}"`;
        }

        if (!runTests) {
            if (buildVersion) {
                buildArgs += ` -buildVersion "${buildVersion}"`;
            }
            if (buildNumber) {
                buildArgs += ` -buildNumber "${buildNumber}"`;
            }
            if (buildDefines) {
                buildArgs += ` -buildDefines "${buildDefines}"`;
            }
            if (buildOptions) {
                buildArgs += ` -buildOptions "${buildOptions}"`;
            }
            const graphicsFlag = noGraphics ? '-nographics' : '';
            await exec.exec(`${unityCmd} -batchmode ${graphicsFlag} -quit -logFile "-" ${buildArgs}`);
        } else {
            const testGraphicsFlag = noGraphics ? '-nographics' : '';
            await exec.exec(`${unityCmd} -runTests -batchmode ${testGraphicsFlag} ${buildArgs}`);
        }

        core.setOutput('build-path', buildPath);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();

