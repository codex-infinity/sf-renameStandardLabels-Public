({
    handleRename: function (cmp, source) {
        console.log(source + ' called - delegating to helper');
        if (cmp.get("v.hasRenamed")) {
            return;
        }
        this.doRenameLabels(cmp);
    },
    doRenameLabels: function(cmp, maxRetries, delayMs) {
        if (typeof maxRetries === 'undefined') { maxRetries = 5; }
        if (typeof delayMs === 'undefined') { delayMs = 500; }
        const attempt = function(retriesLeft) {
            try {
                let utilityAPI = cmp.find("utilitybarapi");
                if (!utilityAPI || !utilityAPI.getAllUtilityInfo) {
                    if (retriesLeft > 0) {
                        window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                        return;
                    } else {
                        console.warn('utilitybarapi not available after retries');
                        return;
                    }
                }

                utilityAPI.getAllUtilityInfo().then(function (utilityItens) {
                    console.log('Helper Utility Info: ', utilityItens);
                    let labelsAndTranslates = $A.get('$Resource.labelsAndTranslates');
                    console.log('Helper Labels and Translates: ', labelsAndTranslates);
                    window.fetch(labelsAndTranslates)
                        .then($A.getCallback((response) => {
                            if (!response.ok) {
                                throw new Error(`HTTP error, status = ${response.status}`);
                            }
                            response.json()
                                .then($A.getCallback((data) => {
                                    const map = new Map();
                                    let locale = $A.get("$Locale.langLocale");
                                    const translations = data[locale] || data['en_US'];
                                    if (!translations) {
                                        console.warn('No translations found for locale:', locale);
                                        return;
                                    }
                                    Object.keys(translations).forEach(key => {
                                        map.set(key, translations[key]);
                                    });
                                    utilityItens.forEach((item) => {
                                        if (map.has(item.utilityLabel)) {
                                            utilityAPI.setUtilityLabel({
                                                utilityId: item.id,
                                                label: map.get(item.utilityLabel)
                                            });
                                            if (cmp.get("v.enableSetPanelHeaderLabel")) {
                                                utilityAPI.setPanelHeaderLabel({
                                                    utilityId: item.id,
                                                    label: map.get(item.utilityLabel)
                                                });
                                            }
                                        }
                                    });
                                    cmp.set("v.hasRenamed", true);
                                }));
                        }))
                        .catch($A.getCallback((error) => {
                            console.error('Helper Fetch Error :-S', error);
                        }));
                });
            } catch (e) {
                console.error('doRenameLabels error', e);
            }
        };

        attempt(maxRetries);
    }
})