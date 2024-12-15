// ==UserScript==
// @name         Grepolis Action Logger with Full Details
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Log all action details with a time stamp and display them with spaces between actions
// @author       You
// @match        https://*.grepolis.com/*
// @grant        GM_download
// ==/UserScript==

(function() {
    'use strict';

    // Variables
    let loggingEnabled = false;
    let log = [];
    let actionCount = 0;

    // Create the buttons for starting, stopping and downloading the log
    const startButton = document.createElement('button');
    const stopButton = document.createElement('button');
    const downloadButton = document.createElement('button');
    const badge = document.createElement('span');

    startButton.textContent = 'Start Logging';
    stopButton.textContent = 'Stop Logging';
    downloadButton.textContent = 'Download Log';
    badge.textContent = '0'; // Initial log count
    badge.style.position = 'absolute';
    badge.style.top = '-10px';
    badge.style.right = '-10px';
    badge.style.backgroundColor = 'red';
    badge.style.color = 'white';
    badge.style.borderRadius = '50%';
    badge.style.padding = '5px 10px';
    badge.style.fontSize = '14px';

    // Styling for buttons (you can adjust this as needed)
    startButton.style.position = 'fixed';
    startButton.style.bottom = '10px';
    startButton.style.left = '10px';
    startButton.style.zIndex = '1000';
    stopButton.style.position = 'fixed';
    stopButton.style.bottom = '10px';
    stopButton.style.left = '120px';
    stopButton.style.zIndex = '1000';
    downloadButton.style.position = 'fixed';
    downloadButton.style.bottom = '10px';
    downloadButton.style.left = '240px';
    downloadButton.style.zIndex = '1000';

    // Append the buttons and badge to the body
    downloadButton.appendChild(badge);
    document.body.appendChild(startButton);
    document.body.appendChild(stopButton);
    document.body.appendChild(downloadButton);

    // Function to log an action with detailed information
    function logAction(actionType, targetElement) {
        if (loggingEnabled) {
            const timestamp = new Date().toISOString();
            let logEntry = `// Action: ${actionType} | Time: ${timestamp}`;
            logEntry += `\nElement Type: ${targetElement.tagName}`;
            logEntry += `\nElement ID: ${targetElement.id || 'N/A'}`;
            logEntry += `\nElement Class: ${targetElement.className || 'N/A'}`;
            logEntry += `\nElement Value: ${targetElement.value || 'N/A'}`;
            logEntry += `\nElement Text Content: ${targetElement.textContent.trim() || 'N/A'}`;
            logEntry += `\n==============================\n`; // Space between actions

            log.push(logEntry);
            actionCount++;
            badge.textContent = actionCount; // Update badge with action count
        }
    }

    // Start logging
    startButton.addEventListener('click', () => {
        loggingEnabled = true;
        log = []; // Clear any previous logs
        actionCount = 0; // Reset action count
        badge.textContent = '0'; // Reset badge
        log.push('// Logging started');
        console.log('Logging started');
    });

    // Stop logging
    stopButton.addEventListener('click', () => {
        loggingEnabled = false;
        log.push('// Logging stopped');
        console.log('Logging stopped');
    });

    // Download the log as a .js file
    downloadButton.addEventListener('click', () => {
        if (log.length === 0) {
            alert('No actions to download.');
            return;
        }

        const logContent = log.join('\n');
        const blob = new Blob([logContent], { type: 'text/javascript' });

        // Create a download link and simulate click
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'grepolis_action_log.js';
        link.click();
    });

    // Log some common actions (can be extended with more actions as needed)
    document.body.addEventListener('click', (event) => {
        const target = event.target;
        if (target) {
            logAction('Clicked', target);
        }
    });

    document.body.addEventListener('input', (event) => {
        const target = event.target;
        if (target) {
            logAction('Input', target);
        }
    });

    document.body.addEventListener('change', (event) => {
        const target = event.target;
        if (target) {
            logAction('Changed', target);
        }
    });

    // Other possible actions can be added to this list, like mouse movements or key presses.
})();
