// ==UserScript==
// @name         Grepolis location logger
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Log de locatie van geklikte elementen in Grepolis en download de logs in een .js-bestand.
// @author       Elona
// @match        https://*.grepolis.com/game/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let isLogging = false; // Logging status
    const logs = []; // Array voor opgeslagen logs

    // Functie om een XPath te genereren
    function getXPath(element) {
        if (element.id) {
            return `//*[@id="${element.id}"]`;
        }
        if (element === document.body) {
            return '/html/body';
        }
        const ix = Array.from(element.parentNode.childNodes).filter(
            (node) => node.nodeName === element.nodeName
        ).indexOf(element) + 1;
        return `${getXPath(element.parentNode)}/${element.nodeName.toLowerCase()}[${ix}]`;
    }

    // Functie om logs op te slaan
    function logElement(event) {
        if (!isLogging) return;

        const element = event.target;
        const log = {
            tag: element.tagName,
            id: element.id || 'N/A',
            class: element.className || 'N/A',
            xpath: getXPath(element),
        };

        logs.push(log);
        updateLogCount();
        console.log('Gelogd element:', log);
    }

    // Functie om het aantal logs bij te werken
    function updateLogCount() {
        const logCounter = document.querySelector('#logCounter');
        if (logCounter) {
            logCounter.textContent = logs.length;
        }
    }

    // Functie om de logs te downloaden
    function downloadLogs() {
        const logData = `const logs = ${JSON.stringify(logs, null, 4)};`;
        const blob = new Blob([logData], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grepolis_logs.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Start/stop de logger
    function toggleLogging() {
        isLogging = !isLogging;
        const status = isLogging ? 'Actief' : 'Gestopt';
        console.log(`Logging is nu ${status}.`);
        document.querySelector('#toggleLogger').textContent = `Logger: ${status}`;
    }

    // UI toevoegen
    function addUI() {
        // Controleer of UI al bestaat
        if (document.querySelector('#loggerUI')) return;

        const uiContainer = document.createElement('div');
        uiContainer.id = 'loggerUI';
        uiContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 99999;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 5px;
            font-size: 14px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
        `;

        // Start/Stop-knop
        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggleLogger';
        toggleButton.textContent = 'Logger: Gestopt';
        toggleButton.style.cssText = `
            display: block;
            margin-bottom: 10px;
            padding: 10px;
            background: #0074d9;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            width: 150px;
        `;
        toggleButton.addEventListener('click', toggleLogging);
        uiContainer.appendChild(toggleButton);

        // Downloadknop
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download Logs';
        downloadButton.style.cssText = `
            display: block;
            padding: 10px;
            background: #2ecc40;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            width: 150px;
        `;
        downloadButton.addEventListener('click', downloadLogs);
        uiContainer.appendChild(downloadButton);

        // Log-teller
        const logCounter = document.createElement('div');
        logCounter.id = 'logCounter';
        logCounter.textContent = '0';
        logCounter.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            background: red;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            text-align: center;
            line-height: 20px;
            font-size: 12px;
            font-weight: bold;
        `;
        downloadButton.style.position = 'relative';
        downloadButton.appendChild(logCounter);

        document.body.appendChild(uiContainer);
    }

    // Gebruik MutationObserver om te wachten tot de DOM volledig is geladen
    const observer = new MutationObserver(() => {
        if (document.body) {
            addUI();
            observer.disconnect();
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Eventlistener toevoegen voor klikken
    document.addEventListener('click', logElement);
})();
