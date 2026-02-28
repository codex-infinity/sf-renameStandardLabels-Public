({
    onLocationChange: function (cmp, event, helper) {
        try {
            helper.logDebug(cmp, '[onLocationChange] called');
            helper.handleRename(cmp, 'onLocationChange');
        } catch (e) {
            helper.logError(cmp, '[onLocationChange] unexpected error:', e);
        }
    },
    onRender: function (cmp, event, helper) {
        try {
            helper.logDebug(cmp, '[onRender] called');
            helper.handleRename(cmp, 'onRender');
        } catch (e) {
            helper.logError(cmp, '[onRender] unexpected error:', e);
        }
    },
    onInit: function (cmp, event, helper) {
        try {
            helper.logDebug(cmp, '[onInit] called');
            helper.handleRename(cmp, 'onInit');
        } catch (e) {
            helper.logError(cmp, '[onInit] unexpected error:', e);
        }
    },
    onTabCreated: function (cmp, event, helper) {
        try {
            helper.logDebug(cmp, '[onTabCreated] called');
            helper.handleRename(cmp, 'onTabCreated');
        } catch (e) {
            helper.logError(cmp, '[onTabCreated] unexpected error:', e);
        }
    },
    onTabClosed: function (cmp, event, helper) {
        try {
            helper.logDebug(cmp, '[onTabClosed] called');
            helper.handleRename(cmp, 'onTabClosed');
        } catch (e) {
            helper.logError(cmp, '[onTabClosed] unexpected error:', e);
        }
    },
    onTabFocused: function (cmp, event, helper) {
        try {
            helper.logDebug(cmp, '[onTabFocused] called');
            helper.handleRename(cmp, 'onTabFocused');
        } catch (e) {
            helper.logError(cmp, '[onTabFocused] unexpected error:', e);
        }
    },
    onTabRefreshed: function (cmp, event, helper) {
        try {
            helper.logDebug(cmp, '[onTabRefreshed] called');
            helper.handleRename(cmp, 'onTabRefreshed');
        } catch (e) {
            helper.logError(cmp, '[onTabRefreshed] unexpected error:', e);
        }
    },
    onTabReplaced: function (cmp, event, helper) {
        try {
            helper.logDebug(cmp, '[onTabReplaced] called');
            helper.handleRename(cmp, 'onTabReplaced');
        } catch (e) {
            helper.logError(cmp, '[onTabReplaced] unexpected error:', e);
        }
    },
    onTabUpdated: function (cmp, event, helper) {
        helper.handleRename(cmp, 'onTabUpdated');
    }
})
