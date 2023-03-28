/*!
 * Copyright Jagex Games Ltd 2015
 * Some code used from http://www.rajeshsegu.com
 * Used to test whether a given protocol is supported
 * Please allow ~1000ms for the result as some systems take longer than others
 * protocolStr represents the full url we wish to test
 */
var protocolSupport=[],
checkProtocol = function(protocolStr,browser){
 //Updates the array with the result for the given protcol
 function updateResult(result){
  protocolSupport[protocolStr]=result;
 }
 //Define result as null
 updateResult(null);
 bodyElement = $('body');
 //Different browsers have different detection methods so run the relevant one
 //Firefox
 function checkMozilla(){
  bodyElement.append("<iframe src='#' id='hiddenIframe' style='display: none;'></iframe>");
  var iFrame = $('#hiddenIframe');
  //Set iframe.src and handle exception
  try {
   iFrame[0].contentWindow.location.href = protocolStr;
   if(browser !== 'msie'){iFrame.remove()};
   updateResult(true);
  }
  catch (e) {
   if(browser !== 'msie'){iFrame.remove()};
   updateResult(false);
  }
 }
 //Chrome
 function checkChrome(){
  bodyElement.append("<input type='text' id='focusInput' style='background: transparent;border: none;height: 0px;width: 0px;' />");
  var focusBodyElement = $('#focusInput')[0], temporaryResult = false;
  focusBodyElement.focus();
  focusBodyElement.onblur = function () {
   updateResult(true);
   return;
  };
  //will trigger onblur
  location.href = protocolStr;

  //Note: timeout could vary as per the browser version, have a higher value
  setTimeout(function () {
   focusBodyElement.onblur = null;
   if(protocolSupport[protocolStr]===null){updateResult(false);}
   },
   1000
  );
  
 }
 function checkEdge(){
  if (navigator.msLaunchUri) {
   navigator.msLaunchUri(protocolStr,
    function () {//success
     updateResult(true);
     return;
    },
    function () {//failure 
     updateResult(false);
    }
   );
  } else {
      // When Edge moves to Chromium it will need to use the Chrome system
            checkChrome();
        }
 }
 function checkSafari() {
     var timeout, iframe, handler;
     
        timeout = setTimeout(function () {
            updateResult(false);
            handler.remove();
        }, 1000);

        iframe = document.querySelector("#hiddenIframe");
        if (!iframe) {
            iframe = document.createElement("iframe");
            iframe.src = protocolStr;
            iframe.id = "hiddenIframe";
            iframe.style.display = "none";
            document.body.appendChild(iframe);
        }

        window.addEventListener("blur", onBlur);
        handler = {
            remove: function () {
                window.removeEventListener("blur", onBlur);
            }
        };

        function onBlur() {
            clearTimeout(timeout);
            handler.remove();
            updateResult(true);
        }

        iframe.contentWindow.location.href = protocolStr;
    }
 //Detect which tests to run - if we dont know the browser assume chrome
 switch(browser){
        case 'Firefox':
  case 'Mozilla':
   checkMozilla();
   break;
  case 'Chrome':
   checkChrome();
   break;
  case 'IE':
        case 'IEMobile':
   checkMozilla();//Temporary fix to use FF method. We need to address this later
   break;
  case 'Edge':
   checkEdge();
   break;
        case 'Mobile Safari':
        case 'Safari':
            checkSafari();
            break;
  default:
   checkChrome();
   break;
 }
};
