({
    handleRename: function (cmp, source) {
        try {
            console.log(`[handleRename] ${source} called - delegating to helper`);
            if (cmp.get("v.hasRenamed")) {
                console.log('[handleRename] v.hasRenamed já está true, não executa novamente.');
                return;
            }
            this.doRenameLabels(cmp);
        } catch (e) {
            console.error(`[handleRename] erro inesperado em ${source}:`, e);
        }
    },
    doRenameLabels: function(cmp, maxRetries, delayMs) {
        console.log('[doRenameLabels] chamada', { maxRetries, delayMs });
        if (typeof maxRetries === 'undefined') { maxRetries = 5; }
        if (typeof delayMs === 'undefined') { delayMs = 500; }
        const attempt = function(retriesLeft) {
            console.log(`[doRenameLabels][attempt] Tentativa com retriesLeft=`, retriesLeft);
            try {
                let utilityAPI = cmp.find("utilitybarapi");
                console.log('[doRenameLabels][attempt] utilityAPI:', utilityAPI);
                if (!utilityAPI || typeof utilityAPI.getAllUtilityInfo !== 'function') {
                    console.warn(`[doRenameLabels][attempt] utilitybarapi.getAllUtilityInfo não é função ou não disponível. retriesLeft=`, retriesLeft, 'utilityAPI:', utilityAPI, 'typeof:', typeof (utilityAPI && utilityAPI.getAllUtilityInfo));
                    if (retriesLeft > 0) {
                        console.log(`[doRenameLabels][attempt] Retentando em ${delayMs}ms...`);
                        window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                        return;
                    } else {
                        console.warn('[doRenameLabels][attempt] utilitybarapi.getAllUtilityInfo não disponível após todas as tentativas');
                        return;
                    }
                }

                try {
                    let p = utilityAPI.getAllUtilityInfo();
                    if (!p || typeof p.then !== 'function') {
                        throw new Error('getAllUtilityInfo não retornou uma Promise');
                    }
                    p.then(function (utilityItens) {
                        try {
                            console.log('[doRenameLabels][attempt] Utility Info:', utilityItens);
                            let labelsAndTranslates = $A.get('$Resource.labelsAndTranslates');
                            console.log('[doRenameLabels][attempt] Labels and Translates:', labelsAndTranslates);
                            window.fetch(labelsAndTranslates)
                                .then($A.getCallback((response) => {
                                    try {
                                        console.log('[doRenameLabels][attempt] fetch response:', response);
                                        if (!response.ok) {
                                            console.error(`[doRenameLabels][attempt] HTTP error, status = ${response.status}`);
                                            throw new Error(`HTTP error, status = ${response.status}`);
                                        }
                                        response.json()
                                            .then($A.getCallback((data) => {
                                                try {
                                                    console.log('[doRenameLabels][attempt] JSON data:', data);
                                                    const map = new Map();
                                                    let locale = $A.get("$Locale.langLocale");
                                                    console.log('[doRenameLabels][attempt] locale:', locale);
                                                    const translations = data[locale] || data['en_US'];
                                                    if (!translations) {
                                                        console.warn('[doRenameLabels][attempt] Nenhuma tradução encontrada para o locale:', locale);
                                                        return;
                                                    }
                                                    Object.keys(translations).forEach(key => {
                                                        map.set(key, translations[key]);
                                                    });
                                                    utilityItens.forEach((item) => {
                                                        if (map.has(item.utilityLabel)) {
                                                            console.log(`[doRenameLabels][attempt] Renomeando utilityId=${item.id} para label=`, map.get(item.utilityLabel));
                                                            utilityAPI.setUtilityLabel({
                                                                utilityId: item.id,
                                                                label: map.get(item.utilityLabel)
                                                            });
                                                            if (cmp.get("v.enableSetPanelHeaderLabel")) {
                                                                console.log(`[doRenameLabels][attempt] Renomeando PanelHeader utilityId=${item.id} para label=`, map.get(item.utilityLabel));
                                                                utilityAPI.setPanelHeaderLabel({
                                                                    utilityId: item.id,
                                                                    label: map.get(item.utilityLabel)
                                                                });
                                                            }
                                                        } else {
                                                            console.log(`[doRenameLabels][attempt] Label não encontrada no mapa para utilityLabel=`, item.utilityLabel);
                                                        }
                                                    });
                                                    cmp.set("v.hasRenamed", true);
                                                    console.log('[doRenameLabels][attempt] Renomeação concluída. v.hasRenamed=true');
                                                } catch (error) {
                                                    console.error('[doRenameLabels][attempt] Erro no response.json() interno:', error, JSON.stringify(error), error && error.stack);
                                                    if (retriesLeft > 0) {
                                                        console.log(`[doRenameLabels][attempt] Retentando após erro em response.json() em ${delayMs}ms...`);
                                                        window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                                                    }
                                                }
                                            }))
                                            .catch($A.getCallback((error) => {
                                                console.error('[doRenameLabels][attempt] Erro no response.json():', error, JSON.stringify(error), error && error.stack);
                                                if (retriesLeft > 0) {
                                                    console.log(`[doRenameLabels][attempt] Retentando após erro em response.json() em ${delayMs}ms...`);
                                                    window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                                                }
                                            }));
                                    } catch (error) {
                                        console.error('[doRenameLabels][attempt] Erro no fetch response:', error, JSON.stringify(error), error && error.stack);
                                        if (retriesLeft > 0) {
                                            console.log(`[doRenameLabels][attempt] Retentando após erro em fetch response em ${delayMs}ms...`);
                                            window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                                        }
                                    }
                                }))
                                .catch($A.getCallback((error) => {
                                    console.error('[doRenameLabels][attempt] Erro no fetch:', error, JSON.stringify(error), error && error.stack);
                                    if (retriesLeft > 0) {
                                        console.log(`[doRenameLabels][attempt] Retentando após erro em fetch em ${delayMs}ms...`);
                                        window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                                    }
                                }));
                        } catch (error) {
                            console.error('[doRenameLabels][attempt] Erro interno no then de getAllUtilityInfo:', error, JSON.stringify(error), error && error.stack);
                            if (retriesLeft > 0) {
                                console.log(`[doRenameLabels][attempt] Retentando após erro interno em ${delayMs}ms...`);
                                window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                            }
                        }
                    })
                    .catch($A.getCallback((error) => {
                        console.error('[doRenameLabels][attempt] Erro no getAllUtilityInfo:', error, JSON.stringify(error), error && error.stack);
                        if (retriesLeft > 0) {
                            console.log(`[doRenameLabels][attempt] Retentando após erro em getAllUtilityInfo em ${delayMs}ms...`);
                            window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                        }
                    }));
                } catch (error) {
                    console.error('[doRenameLabels][attempt] Erro síncrono em getAllUtilityInfo:', error, JSON.stringify(error), error && error.stack);
                    if (retriesLeft > 0) {
                        console.log(`[doRenameLabels][attempt] Retentando após erro síncrono em ${delayMs}ms...`);
                        window.setTimeout($A.getCallback(() => attempt(retriesLeft - 1)), delayMs);
                    }
                }
            } catch (e) {
                console.error('[doRenameLabels][attempt] erro geral:', e);
            }
        };

        try{
            attempt(maxRetries);
        }catch(e){
            console.error('[doRenameLabels] error in try attempts', e);
        }
    }
})