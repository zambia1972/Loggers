// ==UserScript==
// @name         Grepolis API Logger
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Log API calls in Grepolis and download logs as a text file
// @author       YourName
// @match        *.grepolis.com/*
// @grant        GM_download
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Variables to store logs and state
    let isLogging = false;
    let logs = [];

    // Add UI to the Grepolis interface
    const loggerUI = document.createElement('div');
    loggerUI.id = 'grepolis-api-logger';
    loggerUI.innerHTML = `
        <div>
            <button id="start-logging">Start Logging</button>
            <button id="stop-logging" disabled>Stop Logging</button>
            <button id="download-logs" disabled>Download Logs</button>
            <div id="log-counter" style="margin-top: 10px;">Logged API Calls: 0</div>
        </div>
    `;
    document.body.appendChild(loggerUI);

    // Add styles for UI
    GM_addStyle(`
        #grepolis-api-logger {
            position: fixed;
            bottom: 40px;
            left: 20px;
            z-index: 9999;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 14px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }
        #grepolis-api-logger button {
            margin: 5px;
            padding: 5px 10px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        #grepolis-api-logger button:disabled {
            background: #555;
            cursor: not-allowed;
        }
        #log-counter {
            font-size: 12px;
            color: #ddd;
        }
    `);

    // Button event listeners
    document.getElementById('start-logging').addEventListener('click', () => {
        isLogging = true;
        logs = [];
        document.getElementById('start-logging').disabled = true;
        document.getElementById('stop-logging').disabled = false;
        document.getElementById('download-logs').disabled = true;
        updateLogCounter();
        console.log('API logging started');
    });

    document.getElementById('stop-logging').addEventListener('click', () => {
        isLogging = false;
        document.getElementById('start-logging').disabled = false;
        document.getElementById('stop-logging').disabled = true;
        document.getElementById('download-logs').disabled = logs.length === 0;
        console.log('API logging stopped');
    });

    document.getElementById('download-logs').addEventListener('click', () => {
        const logBlob = new Blob([logs.join('\n')], { type: 'text/plain' });
        GM_download({
            url: URL.createObjectURL(logBlob),
            name: 'grepolis-api-logs.txt',
            saveAs: true
        });
    });

    // Hook into fetch API to log API calls
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        if (isLogging) {
            const [url, options] = args;
            const method = options?.method || 'GET';
            const body = options?.body || null;

            const logEntry = `Method: ${method}\nURL: ${url}\nBody: ${body || 'N/A'}\n---`;
            logs.push(logEntry);
            updateLogCounter();
            console.log('Logged API call:', logEntry);
        }

        return originalFetch.apply(this, args);
    };

    // Update log counter display
    function updateLogCounter() {
        document.getElementById('log-counter').innerText = `Logged API Calls: ${logs.length}`;
    }
})();
