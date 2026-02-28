({
    logDebug: function(cmp, msg, obj) {
        if (cmp.get("v.enableDebugLog")) {
            if (typeof obj !== 'undefined') {
                console.log('[DEBUG]', msg, obj);
            } else {
                console.log('[DEBUG]', msg);
            }
        }
    },
    logWarn: function(cmp, msg, obj) {
        if (cmp.get("v.enableDebugLog")) {
            if (typeof obj !== 'undefined') {
                console.warn('[DEBUG]', msg, obj);
            } else {
                console.warn('[DEBUG]', msg);
            }
        }
    },
    logError: function(cmp, msg, obj) {
        if (cmp.get("v.enableDebugLog")) {
            if (typeof obj !== 'undefined') {
                console.error('[DEBUG]', msg, obj);
            } else {
                console.error('[DEBUG]', msg);
            }
        }
    },
    handleRename: function (cmp, source) {
        try {
            this.logDebug(cmp, '[handleRename] ' + source + ' called - delegating to helper');
            if (cmp.get("v.hasRenamed")) {
                this.logDebug(cmp, '[handleRename] v.hasRenamed is already true, skipping execution.');
                return;
            }
            this.doRenameLabels(cmp);
        } catch (e) {
            this.logError(cmp, '[handleRename] unexpected error in ' + source + ':', e);
        }
    },
    doRenameLabels: function(cmp, maxRetries, delayMs) {
        this.logDebug(cmp, '[doRenameLabels] called, maxRetries=' + maxRetries + ', delayMs=' + delayMs);
        if (typeof maxRetries === 'undefined') { maxRetries = 5; }
        if (typeof delayMs === 'undefined') { delayMs = 500; }
        var self = this;
        var attempt = function(retriesLeft) {
            self.logDebug(cmp, '[doRenameLabels][attempt] Attempt with retriesLeft=' + retriesLeft);
            try {
                let utilityAPI = cmp.find("utilitybarapi");
                self.logDebug(cmp, '[doRenameLabels][attempt] utilityAPI:', utilityAPI);
                if (!utilityAPI || typeof utilityAPI.getAllUtilityInfo !== 'function') {
                    self.logWarn(cmp, '[doRenameLabels][attempt] utilitybarapi.getAllUtilityInfo is not a function or unavailable. retriesLeft=' + retriesLeft + ', typeof=' + typeof (utilityAPI && utilityAPI.getAllUtilityInfo), utilityAPI);
                    if (retriesLeft > 0) {
                        self.logDebug(cmp, '[doRenameLabels][attempt] Retrying in ' + delayMs + 'ms...');
                        window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                        return;
                    } else {
                        self.logWarn(cmp, '[doRenameLabels][attempt] utilitybarapi.getAllUtilityInfo unavailable after all attempts');
                        return;
                    }
                }

                try {
                    let p = utilityAPI.getAllUtilityInfo();
                    if (!p || typeof p.then !== 'function') {
                        throw new Error('getAllUtilityInfo did not return a Promise');
                    }
                    p.then(function (utilityItens) {
                        try {
                            self.logDebug(cmp, '[doRenameLabels][attempt] Utility Info:', utilityItens);
                            let labelsAndTranslates = $A.get('$Resource.labelsAndTranslates');
                            self.logDebug(cmp, '[doRenameLabels][attempt] Labels and Translates:', labelsAndTranslates);
                            window.fetch(labelsAndTranslates)
                                .then($A.getCallback((response) => {
                                    try {
                                        self.logDebug(cmp, '[doRenameLabels][attempt] fetch response:', response);
                                        if (!response.ok) {
                                            self.logError(cmp, '[doRenameLabels][attempt] HTTP error, status = ' + response.status);
                                            throw new Error(`HTTP error, status = ${response.status}`);
                                        }
                                        response.json()
                                            .then($A.getCallback((data) => {
                                                try {
                                                    self.logDebug(cmp, '[doRenameLabels][attempt] JSON data:', data);
                                                    const map = new Map();
                                                    let locale = $A.get("$Locale.langLocale");
                                                    self.logDebug(cmp, '[doRenameLabels][attempt] locale:', locale);
                                                    const translations = data[locale] || data['en_US'];
                                                    if (!translations) {
                                                        self.logWarn(cmp, '[doRenameLabels][attempt] No translations found for locale: ' + locale);
                                                        return;
                                                    }
                                                    Object.keys(translations).forEach(key => {
                                                        map.set(key, translations[key]);
                                                    });
                                                    utilityItens.forEach((item) => {
                                                        if (map.has(item.utilityLabel)) {
                                                            self.logDebug(cmp, '[doRenameLabels][attempt] Renaming utilityId=' + item.id + ' to label=', map.get(item.utilityLabel));
                                                            utilityAPI.setUtilityLabel({
                                                                utilityId: item.id,
                                                                label: map.get(item.utilityLabel)
                                                            });
                                                            if (cmp.get("v.enableSetPanelHeaderLabel")) {
                                                                self.logDebug(cmp, '[doRenameLabels][attempt] Renaming PanelHeader utilityId=' + item.id + ' to label=', map.get(item.utilityLabel));
                                                                utilityAPI.setPanelHeaderLabel({
                                                                    utilityId: item.id,
                                                                    label: map.get(item.utilityLabel)
                                                                });
                                                            }
                                                        } else {
                                                            self.logDebug(cmp, '[doRenameLabels][attempt] Label not found in map for utilityLabel=' + item.utilityLabel);
                                                        }
                                                    });
                                                    cmp.set("v.hasRenamed", true);
                                                    self.logDebug(cmp, '[doRenameLabels][attempt] Rename finished. v.hasRenamed=true');
                                                } catch (error) {
                                                    self.logError(cmp, '[doRenameLabels][attempt] Error in response.json() inner: ' + (error && error.message ? error.message : ''), error);
                                                    if (retriesLeft > 0) {
                                                        self.logDebug(cmp, '[doRenameLabels][attempt] Retrying after error in response.json() in ' + delayMs + 'ms...');
                                                        window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                                                    }
                                                }
                                            }))
                                            .catch($A.getCallback((error) => {
                                                self.logError(cmp, '[doRenameLabels][attempt] Error in response.json(): ' + (error && error.message ? error.message : ''), error);
                                                if (retriesLeft > 0) {
                                                    self.logDebug(cmp, '[doRenameLabels][attempt] Retrying after error in response.json() in ' + delayMs + 'ms...');
                                                    window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                                                }
                                            }));
                                    } catch (error) {
                                        self.logError(cmp, '[doRenameLabels][attempt] Error in fetch response: ' + (error && error.message ? error.message : ''), error);
                                        if (retriesLeft > 0) {
                                            self.logDebug(cmp, '[doRenameLabels][attempt] Retrying after error in fetch response in ' + delayMs + 'ms...');
                                            window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                                        }
                                    }
                                }))
                                .catch($A.getCallback((error) => {
                                    self.logError(cmp, '[doRenameLabels][attempt] Error in fetch: ' + (error && error.message ? error.message : ''), error);
                                    if (retriesLeft > 0) {
                                        self.logDebug(cmp, '[doRenameLabels][attempt] Retrying after error in fetch in ' + delayMs + 'ms...');
                                        window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                                    }
                                }));
                        } catch (error) {
                            self.logError(cmp, '[doRenameLabels][attempt] Internal error in then of getAllUtilityInfo: ' + (error && error.message ? error.message : ''), error);
                            if (retriesLeft > 0) {
                                self.logDebug(cmp, '[doRenameLabels][attempt] Retrying after internal error in ' + delayMs + 'ms...');
                                window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                            }
                        }
                    })
                    .catch($A.getCallback((error) => {
                        self.logError(cmp, '[doRenameLabels][attempt] Error in getAllUtilityInfo: ' + (error && error.message ? error.message : ''), error);
                        if (retriesLeft > 0) {
                            self.logDebug(cmp, '[doRenameLabels][attempt] Retrying after error in getAllUtilityInfo in ' + delayMs + 'ms...');
                            window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                        }
                    }));
                } catch (error) {
                    self.logError(cmp, '[doRenameLabels][attempt] Synchronous error in getAllUtilityInfo: ' + (error && error.message ? error.message : ''), error);
                    if (retriesLeft > 0) {
                        self.logDebug(cmp, '[doRenameLabels][attempt] Retrying after synchronous error in ' + delayMs + 'ms...');
                        window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                    }
                }
            } catch (e) {
                self.logError(cmp, '[doRenameLabels][attempt] General error: ' + (e && e.message ? e.message : ''), e);
            }
        };

        try{
            attempt(maxRetries);
        }catch(e){
            this.logError(cmp, '[doRenameLabels] error in try attempts: ' + (e && e.message ? e.message : ''), e);
        }
    }
})