// ==UserScript==
// @name         Grepolis API Info Collector
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Collects API information and allows real-time logging
// @author       CODAI
// @match        https://*.grepolis.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Store API request logs
    let apiLogs = [];

    // CORS Proxy URL (use this to bypass CORS restrictions)
    const proxy = 'https://corsproxy.io/';  // Using an alternative proxy for testing

    // Function to make the API call and log the data
    function makeAPICall(endpoint, method, parameters) {
        // Log the details of the API call
        const logEntry = {
            timestamp: new Date().toISOString(),
            endpoint: endpoint,
            method: method,
            parameters: parameters
        };
        apiLogs.push(logEntry);

        // Construct the full API URL
        const fullUrl = `https://*.grepolis.com${endpoint}?${new URLSearchParams(parameters)}`;

        // Log the constructed URL for debugging purposes
        console.log("Making API call to:", fullUrl);

        // Make the actual API call using the CORS proxy
        fetch(proxy + fullUrl, {
            method: method,
            headers: {
                'Authorization': `Bearer wst-98a80e-2a44-4704-9139-753d5deeab9b`  // Replace with valid token
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data);
            logEntry.response = data;  // Save the API response in log
            alert('API Response logged!');
        })
        .catch(error => {
            console.error('Error with API call:', error);
            logEntry.error = error.message || error;
        });
    }

    // Function to create a field for input and buttons
    function createInputFields() {
        // Create container for input fields and buttons
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '130px';
        container.style.left = '50px';
        container.style.zIndex = '1000';
        container.style.padding = '10px';
        container.style.backgroundColor = '#fff';
        container.style.border = '1px solid #000';

        // Create label and input fields for Endpoint, Method, and Parameters
        const endpointLabel = document.createElement('label');
        endpointLabel.textContent = 'Endpoint:';
        const endpointInput = document.createElement('input');
        endpointInput.type = 'text';
        endpointInput.placeholder = '/api/34';

        const methodLabel = document.createElement('label');
        methodLabel.textContent = 'Method:';
        const methodInput = document.createElement('input');
        methodInput.type = 'text';
        methodInput.placeholder = 'GET';

        const parametersLabel = document.createElement('label');
        parametersLabel.textContent = 'Parameters:';
        const parametersInput = document.createElement('textarea');
        parametersInput.placeholder = '{"id":703}';

        // Create buttons
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Make API Call';
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download Logs';

        // Event listener for API call button
        submitButton.addEventListener('click', () => {
            const endpoint = endpointInput.value;
            const method = methodInput.value;
            let parameters;

            // Try parsing parameters and handle errors
            try {
                parameters = JSON.parse(parametersInput.value);
            } catch (e) {
                console.error('Invalid JSON format for parameters:', e);
                alert('Invalid JSON format for parameters!');
                return;
            }

            // Call the API and log the details
            makeAPICall(endpoint, method, parameters);
        });

        // Event listener for downloading logs
        downloadButton.addEventListener('click', () => {
            downloadLogs();
        });

        // Append all elements to the container
        container.appendChild(endpointLabel);
        container.appendChild(endpointInput);
        container.appendChild(document.createElement('br'));
        container.appendChild(methodLabel);
        container.appendChild(methodInput);
        container.appendChild(document.createElement('br'));
        container.appendChild(parametersLabel);
        container.appendChild(parametersInput);
        container.appendChild(document.createElement('br'));
        container.appendChild(submitButton);
        container.appendChild(downloadButton);

        // Append container to the body
        document.body.appendChild(container);
    }

    // Function to download the logs as a text file
    function downloadLogs() {
        const blob = new Blob([JSON.stringify(apiLogs, null, 2)], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'api_logs.txt';
        link.click();
    }

    // Create input fields and buttons on page load
    createInputFields();

    console.log('Grepolis API Info Collector initialized.');
})();
