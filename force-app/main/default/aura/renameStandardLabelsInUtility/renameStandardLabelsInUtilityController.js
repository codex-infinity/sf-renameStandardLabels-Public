({
    onLocationChange: function (cmp, event, helper) {
        helper.handleRename(cmp, 'onLocationChange');
    },
    onRender: function (cmp, event, helper) {
        helper.handleRename(cmp, 'onRender');
    },
    onInit: function (cmp, event, helper) {
        try {
            console.log('[onInit] chamado');
            helper.handleRename(cmp, 'onInit');
        } catch (e) {
            console.error('[onInit] erro inesperado:', e);
        }
    },
    onTabCreated: function (cmp, event, helper) {
        helper.handleRename(cmp, 'onTabCreated');
    },
    onTabClosed: function (cmp, event, helper) {
        helper.handleRename(cmp, 'onTabClosed');
    },
    onTabFocused: function (cmp, event, helper) {
        helper.handleRename(cmp, 'onTabFocused');
    },
    onTabRefreshed: function (cmp, event, helper) {
        helper.handleRename(cmp, 'onTabRefreshed');
    },
    onTabReplaced: function (cmp, event, helper) {
        helper.handleRename(cmp, 'onTabReplaced');
    },
    onTabUpdated: function (cmp, event, helper) {
        helper.handleRename(cmp, 'onTabUpdated');
    }
})
