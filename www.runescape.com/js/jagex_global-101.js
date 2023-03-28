//Shared functionality between RS3 and OSRS
var JXGLOBAL = JXGLOBAL || {};
JXGLOBAL.user = {
 agent: {
     result: null,
        os: null,
        browser: null,
     init: function() {
            var parser = new UAParser();
            JXGLOBAL.user.agent.result = parser.getResult();
            JXGLOBAL.user.agent.os = (JXGLOBAL.user.agent.result && JXGLOBAL.user.agent.result.os && JXGLOBAL.user.agent.result.os.name )
                ? JXGLOBAL.user.agent.result.os.name
                : 'unknown';
            JXGLOBAL.user.agent.browser = (JXGLOBAL.user.agent.result && JXGLOBAL.user.agent.result.browser && JXGLOBAL.user.agent.result.browser.name)
                ? JXGLOBAL.user.agent.result.browser.name
                : 'unknown';
        }
    }
};
