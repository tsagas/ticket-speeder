(function() {
    // Helper to safely trigger standard HTML events
    function triggerEvent(element, eventName) {
        const event = new Event(eventName, { bubbles: true });
        element.dispatchEvent(event);
    }

    // Main function to process any dialog/popup
    function processDialog(node) {
        if (!node || !node.querySelector) return;

        // 1. Auto-assign to me when creating a subtask
        const header = node.querySelector('.jira-dialog-heading h2, .aui-dialog2-header-main');
        const headerText = header ? header.textContent.toLowerCase() : '';
        
        if (headerText.includes('create subtask') || node.id === 'create-subtask-dialog') {
            const assignToMeBtn = node.querySelector('#assign-to-me-trigger, .assign-to-me-link');
            if (assignToMeBtn) {
                assignToMeBtn.click();
            }
        }

        // 2, 3, & 4. Auto-Submit for transitions
        const submitBtn = node.querySelector('#issue-workflow-transition-submit');
        if (submitBtn) {
            const btnText = submitBtn.value || '';
            const btnTextLower = btnText.toLowerCase();
            
            // Auto-click for these specific transition popups
            if (
                btnTextLower.includes('start progress') || 
                btnTextLower.includes('back to awaiting implementation') || 
                btnTextLower.includes('back to in progress')
            ) {
                submitBtn.click();
            }
            
            // Auto-Resolve (Requires changing the dropdown first)
            if (btnText === 'Resolve (no testing needed)') {
                // Find the dropdown for resolution
                const resolutionSelect = node.querySelector('select#resolution, select[name="resolution"]');
                
                if (resolutionSelect) {
                    // Search options to find and select "Done"
                    for (let i = 0; i < resolutionSelect.options.length; i++) {
                        if (resolutionSelect.options[i].text.includes('Done')) {
                            resolutionSelect.selectedIndex = i;
                            triggerEvent(resolutionSelect, 'change');
                            break;
                        }
                    }
                }
                
                // Add a tiny delay before clicking submit so Jira registers the dropdown change
                setTimeout(() => {
                    submitBtn.click();
                }, 100);
            }
        }
    }

    // Initial check (in case the popup is loaded as a standalone page)
    processDialog(document);

    // Watch for new Jira dialogs opening dynamically without page reloads
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    processDialog(node);
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
