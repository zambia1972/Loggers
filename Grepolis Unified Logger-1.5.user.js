// ==UserScript==
// @name         Grepolis Unified Logger
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Unified logging for actions, API calls, element locations, and automatic events in Grepolis. Combines related logs into grouped entries with detailed descriptions.
// @author       You
// @match        https://*.grepolis.com/*
// @grant        GM_download
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const circularJSON = require('circular-json');

    // Gebruik de circular-json-bibliotheek
    const circularJSON = window.CircularJSON;

// Nu kunt u circularJSON gebruiken in uw code
    const object = { circular: true, arr: [1, 2, 3] };
    object.self = object;

    const serialized = circularJSON.stringify(object);
    console.log(serialized);

// Now you can use circularJSON in your code

    // Unified log
    let unifiedLogs = [];
    let isLogging = false;

    // Function to group logs
    function groupLogs(logEntry) {
        const relatedLog = unifiedLogs.find(entry =>
            entry.relatedId && logEntry.relatedId && entry.relatedId === logEntry.relatedId
        );
        if (relatedLog) {
            relatedLog.details.push(logEntry);
        } else {
            logEntry.details = [logEntry];
            unifiedLogs.push(logEntry);
        }
    }

    // Function to log actions
    function logAction(eventType, target) {
        if (!isLogging) return;
        const logEntry = {
            type: 'action',
            eventType,
            tag: target.tagName,
            id: target.id || 'N/A',
            class: target.className || 'N/A',
            text: target.textContent.trim() || 'N/A',
            time: new Date().toISOString(),
            description: `User ${eventType} on element ${target.tagName} with id=${target.id}`,
            relatedId: target.id || target.className || null
        };
        groupLogs(logEntry);
        updateLogCount();
    }

    // Function to log API calls
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const [url, options] = args;
        const startTime = performance.now();
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();

        if (isLogging) {
            const logEntry = {
                type: 'api',
                method: options?.method || 'GET',
                url,
                body: options?.body || 'N/A',
                status: response.status,
                statusText: response.statusText,
                duration: `${(endTime - startTime).toFixed(2)} ms`,
                time: new Date().toISOString(),
                description: `API call to ${url} with method ${options?.method || 'GET'}`,
                relatedId: options?.body?.id || null
            };
            groupLogs(logEntry);
            updateLogCount();
        }

        return response.clone();
    };

    // Function to log clicked element locations
    function logLocation(event) {
        if (!isLogging) return;
        const target = event.target;
        const logEntry = {
            type: 'location',
            tag: target.tagName,
            id: target.id || 'N/A',
            class: target.className || 'N/A',
            xpath: getXPath(target),
            time: new Date().toISOString(),
            description: `User clicked on element located at ${getXPath(target)}`,
            relatedId: target.id || target.className || null
        };
        groupLogs(logEntry);
        updateLogCount();
    }

    // Helper function to log automatic events in Grepolis
    function logAutomaticEvents(mutationList) {
        if (!isLogging) return;
        mutationList.forEach(mutation => {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                const logEntry = {
                    type: 'automatic',
                    event: mutation.type,
                    target: mutation.target.outerHTML || 'N/A',
                    addedNodes: Array.from(mutation.addedNodes).map(node => node.outerHTML || node.textContent || 'N/A'),
                    removedNodes: Array.from(mutation.removedNodes).map(node => node.outerHTML || node.textContent || 'N/A'),
                    attributeName: mutation.attributeName || 'N/A',
                    time: new Date().toISOString(),
                    description: `Automatic event: ${mutation.type} on ${mutation.target.tagName || 'N/A'}`,
                    relatedId: mutation.target.id || mutation.target.className || null
                };
                groupLogs(logEntry);
                updateLogCount();
            }
        });
    }

    // Helper function to get XPath of an element
    function getXPath(element) {
        if (element.id) {
            return `//*[@id="${element.id}"]`;
        }
        if (element === document.body) {
            return '/html/body';
        }
        const ix = Array.from(element.parentNode.childNodes)
            .filter(node => node.nodeName === element.nodeName)
            .indexOf(element) + 1;
        return `${getXPath(element.parentNode)}/${element.nodeName.toLowerCase()}[${ix}]`;
    }

    // Function to download unified logs using FileSaver.js
    function downloadLogs() {
        if (unifiedLogs.length === 0) {
            alert('No logs available to download. ensure logs are generated before attempting to download.');
            return;
        }

        // Clone the unifiedLogs array to break circular references
        const logsToDownload = JSON.parse(JSON.stringify(unifiedLogs));

        // Remove circular references from the cloned array
        logsToDownload.forEach(log => {
            delete log.relatedId;
            delete log.details;
        });

        // Use circular-json to stringify the logs
        const jsonString = circularJSON.stringify(logsToDownload, null, 2);

        const blob = new Blob([jsonString], { type: 'application/json' });
        saveAs(blob, 'grepolis_logs.json');
    }

    // Function to update log counter in UI
    function updateLogCount() {
        const counter = document.getElementById('log-count');
        if (counter) {
            counter.textContent = unifiedLogs.length;
        }
    }

    // Function to toggle logging
    function toggleLogging() {
        isLogging = !isLogging;
        const button = document.getElementById('toggle-logging');
        button.textContent = isLogging ? 'Stop Logging' : 'Start Logging';
    }

    // Create UI
    function createUI() {
        const container = document.createElement('div');
        container.id = 'logger-ui';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 10000;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 5px;
            font-size: 14px;
        `;

        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggle-logging';
        toggleButton.textContent = 'Start Logging';
        toggleButton.style.cssText = 'margin-right: 10px;';
        toggleButton.addEventListener('click', toggleLogging);

        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download Logs';
        downloadButton.addEventListener('click', downloadLogs);

        const logCounter = document.createElement('span');
        logCounter.id = 'log-count';
        logCounter.textContent = '0';
        logCounter.style.cssText = 'margin-left: 10px;';

        container.appendChild(toggleButton);
        container.appendChild(downloadButton);
        container.appendChild(document.createTextNode(' Total Logs: '));
        container.appendChild(logCounter);

        document.body.appendChild(container);
    }

    // Initialize with MutationObserver for automatic event logging
    function initializeObservers() {
        const observer = new MutationObserver(logAutomaticEvents);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }

    // Initialize with fallback to ensure UI loads
    function ensureUILoads() {
        const checkInterval = setInterval(() => {
            if (document.body) {
                createUI();
                document.body.addEventListener('click', event => logAction('click', event.target));
                document.body.addEventListener('click', logLocation);
                initializeObservers();
                clearInterval(checkInterval);
            }
        }, 100);
    }

    ensureUILoads();
})();
