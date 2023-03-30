var CM;

CM = CM || {};

CM.lib = CM.lib || {};

CM.global = {
  gtmId: null,
  listenForm: function(pageObj) {
    var $container, $formSubmitButton, $listenedForm, buttonStateLoadingClass, submitted, validatedForm, vistaStyleAttentionClass;
    if (pageObj == null) {
      pageObj = {};
    }
    validatedForm = true;
    submitted = false;
    $container = $('#l-vista__container');
    $listenedForm = $('*[data-abide]');
    $formSubmitButton = $listenedForm.find(':submit');
    buttonStateLoadingClass = 'a-button--state-loading';
    vistaStyleAttentionClass = 'l-vista__container--style-attention';
    if ((pageObj.formSelector != null) && pageObj.formSelector !== null) {
      $listenedForm = $(pageObj.formSelector);
    }
    $listenedForm.on('forminvalid.zf.abide', function() {
      validatedForm = false;
      $container.addClass(vistaStyleAttentionClass);
      return $formSubmitButton.attr('disabled', true).removeClass(buttonStateLoadingClass);
    });
    $listenedForm.on('formvalid.zf.abide', function() {
      return validatedForm = true;
    });
    $('*[data-show-password]').on('click', function() {
      var passwordFieldIdString, passwordFieldIds, thisBox;
      thisBox = $(this);
      passwordFieldIdString = thisBox.data('show-password');
      passwordFieldIds = passwordFieldIdString.split(',');
      return passwordFieldIds.forEach(function(thisId) {
        var passwordField;
        passwordField = $('#' + thisId);
        if (thisBox.is(':checked')) {
          return passwordField.attr('type', 'text');
        } else {
          return passwordField.attr('type', 'password');
        }
      });
    });
    $listenedForm.on('change textInput input', function() {
      $formSubmitButton.removeAttr('disabled').removeClass('a-button--state-loading');
      submitted = false;
      return $container.removeClass(vistaStyleAttentionClass);
    });
    return $listenedForm.on('submit', function(event) {
      if (submitted) {
        event.preventDefault();
      } else {
        if ((pageObj.characterNameValid != null) && !pageObj.characterNameValid) {
          event.preventDefault();
          CM.global.validateNameField(pageObj);
        } else if (validatedForm === true) {
          $formSubmitButton.addClass(buttonStateLoadingClass);
        }
      }
      return submitted = true;
    });
  },
  ajaxNameCheck: function(characterName, pageObj) {
    var ajaxUrl, nameToTestData;
    nameToTestData = {
      displayname: encodeURIComponent(characterName)
    };
    ajaxUrl = 'https://secure.runescape.com/m=account-creation/check_displayname.ajax';
    if ((pageObj.ajaxNameCheckUrl != null) && pageObj.ajaxNameCheckUrl !== null) {
      ajaxUrl = pageObj.ajaxNameCheckUrl;
    }
    if (pageObj.characterNameSuggestions !== null && pageObj.characterNameSuggestions !== void 0 && pageObj.characterNameSuggestions.length > 0) {
      nameToTestData.noNameSuggestions = true;
    }
    return $.ajax({
      type: 'POST',
      cache: false,
      url: ajaxUrl,
      data: nameToTestData,
      success: function(data) {
        return CM.global.handleNameResults(data, pageObj);
      },
      dataType: 'json'
    });
  },
  validateNameField: function(pageObj) {
    var characterName;
    pageObj.characterNameLabel.removeClass('a-label--checker-checking-done');
    pageObj.characterNameLabel.addClass('a-label--checker-checking');
    characterName = pageObj.characterNameField.val();
    if ((characterName != null) && characterName !== '') {
      return CM.global.ajaxNameCheck(characterName, pageObj);
    } else {
      pageObj.characterNameValid = false;
      return pageObj.characterNameLabel.removeClass('a-label--checker-checking');
    }
  },
  handleNameResults: function(data, pageObj) {
    if (data.displayNameIsValid !== void 0 && data.displayNameIsValid === 'false') {
      if ((pageObj.characterNameSuggestions != null) && pageObj.characterNameSuggestions !== null && pageObj.characterNameSuggestions.length > 0) {
        return CM.global.showNameSuggestions(pageObj);
      } else if (data.nameSuggestions !== void 0 && data.nameSuggestions.length > 0) {
        pageObj.characterNameSuggestions = data.nameSuggestions;
        return CM.global.showNameSuggestions(pageObj);
      } else {
        CM.global.hideNameSuggestions(pageObj);
        pageObj.characterNameValid = true;
        return pageObj.characterNameLabel.removeClass('a-label--checker-checking');
      }
    } else {
      CM.global.hideNameSuggestions(pageObj);
      pageObj.characterNameValid = true;
      pageObj.characterNameLabel.addClass('a-label--checker-checking-done');
      return pageObj.characterNameField.removeClass('is-invalid-input');
    }
  },
  redirectUser: function(url, timeout) {
    if (timeout == null) {
      timeout = 2000;
    }
    return setTimeout(function() {
      return document.location = url;
    }, timeout);
  },
  sendGaEvents: function(gaEvents, category, callback, nonInteraction, timeout, label) {
    var eventNameStr;
    if (callback == null) {
      callback = false;
    }
    if (nonInteraction == null) {
      nonInteraction = false;
    }
    if (timeout == null) {
      timeout = 0;
    }
    if (label == null) {
      label = '';
    }
    eventNameStr = 'gaEvent';
    if (nonInteraction) {
      eventNameStr = 'gaEventNI';
    }
    window.dataLayer = window.dataLayer || [];
    return gaEvents.forEach(function(gaEvent) {
      if (callback && !window.google_tag_manager) {
        callback();
      } else {
        return window.dataLayer.push({
          'event': eventNameStr,
          'gaEventCat': category,
          'gaEventAct': gaEvent,
          'gaEventLab': label,
          'eventCallback': function(id) {
            if (callback && (!id || !CM.global.gtmId || id === CM.global.gtmId)) {
              return callback();
            }
          },
          'eventTimeout': timeout
        });
      }
    });
  }
};

CM.lib.characterCounter = {
  initialise: function() {
    return $('*[data-character-counter]').each(function() {
      var $thisCounter, $thisTextField, maxLength;
      $thisCounter = $(this);
      $thisTextField = $('#' + $thisCounter.data('character-counter'));
      maxLength = $thisTextField.attr('maxlength');
      CM.lib.characterCounter.updateCharacterCounter($thisTextField, $thisCounter);
      $thisTextField.on('keypress keyup', function() {
        var entryLength;
        entryLength = CM.lib.characterCounter.getTextLength($thisTextField);
        if (entryLength > maxLength) {
          return false;
        } else {
          return CM.lib.characterCounter.updateCharacterCounter($thisTextField, $thisCounter);
        }
      });
      return $thisTextField.bind('cut paste', function() {
        var charactersOver, currentValue, entryLength;
        entryLength = CM.lib.characterCounter.getTextLength($thisTextField);
        if (entryLength > maxLength) {
          currentValue = $thisTextField.val();
          charactersOver = entryLength - maxLength;
          $thisTextField.val(currentValue.substring(0, currentValue.length - charactersOver));
        }
        return CM.lib.characterCounter.updateCharacterCounter($thisTextField, $thisCounter);
      });
    });
  },
  getTextLength: function(field) {
    return field.val().length + (field.val().match(/\n/g) || []).length;
  },
  updateCharacterCounter: function(thisTextField, characterCounter) {
    var thisCurrentEntry, thisMaxValue, thisRemainingChars;
    thisMaxValue = thisTextField.attr('maxlength');
    thisCurrentEntry = CM.lib.characterCounter.getTextLength(thisTextField);
    thisRemainingChars = thisMaxValue - thisCurrentEntry;
    return characterCounter.text(thisRemainingChars);
  }
};

CM.lib.characterCounter = {
  initialise: function() {
    return $('*[data-character-counter]').each(function() {
      var $thisCounter, $thisTextField, maxLength;
      $thisCounter = $(this);
      $thisTextField = $('#' + $thisCounter.data('character-counter'));
      maxLength = $thisTextField.attr('maxlength');
      CM.lib.characterCounter.updateCharacterCounter($thisTextField, $thisCounter);
      $thisTextField.on('keypress keyup', function() {
        var entryLength;
        entryLength = CM.lib.characterCounter.getTextLength($thisTextField);
        if (entryLength > maxLength) {
          return false;
        } else {
          return CM.lib.characterCounter.updateCharacterCounter($thisTextField, $thisCounter);
        }
      });
      return $thisTextField.bind('cut paste', function() {
        var charactersOver, currentValue, entryLength;
        entryLength = CM.lib.characterCounter.getTextLength($thisTextField);
        if (entryLength > maxLength) {
          currentValue = $thisTextField.val();
          charactersOver = entryLength - maxLength;
          $thisTextField.val(currentValue.substring(0, currentValue.length - charactersOver));
        }
        return CM.lib.characterCounter.updateCharacterCounter($thisTextField, $thisCounter);
      });
    });
  },
  getTextLength: function(field) {
    return field.val().length + (field.val().match(/\n/g) || []).length;
  },
  updateCharacterCounter: function(thisTextField, characterCounter) {
    var thisCurrentEntry, thisMaxValue, thisRemainingChars;
    thisMaxValue = thisTextField.attr('maxlength');
    thisCurrentEntry = CM.lib.characterCounter.getTextLength(thisTextField);
    thisRemainingChars = thisMaxValue - thisCurrentEntry;
    return characterCounter.text(thisRemainingChars);
  }
};

CM.lib.constants = {
  HIDE_CLASS: 'x-display-none'
};

CM.lib.cookies = {
  set: function(type, name, value, expires) {
    var ref;
    if ((typeof Cookiebot !== "undefined" && Cookiebot !== null ? (ref = Cookiebot.consent) != null ? ref[type] : void 0 : void 0) != null) {
      CM.lib.cookies.create(name, value, expires);
    } else {
      window.addEventListener('CookiebotOnAccept', (function(e) {
        if (Cookiebot.consent[type]) {
          return CM.lib.cookies.create(name, value, expires);
        }
      }), false);
    }
  },
  create: function(name, value, expires) {
    Cookies.set(name, value, {
      expires: expires,
      domain: 'runescape.com'
    });
  }
};

CM.lib.dialog = {
  openDialog: function(dialog) {
    if (typeof dialog[0].showModal !== 'undefined') {
      dialog[0].showModal();
    } else {
      dialog[0].setAttribute('open', true);
    }
  },
  closeDialog: function(dialog, onClose) {
    if (typeof dialog[0].close !== 'undefined') {
      dialog[0].close();
    } else {
      dialog[0].removeAttribute('open');
    }
    onClose();
  },
  initialise: function(onClose) {
    $('[data-js-dialog-close]').on('click', function(ev) {
      var thisDialog;
      ev.preventDefault();
      thisDialog = $(this).closest('[data-js-dialog]');
      CM.lib.dialog.closeDialog(thisDialog, onClose);
    });
    $('[data-js-dialog-background]').on('click', function(ev) {
      var thisDialog;
      ev.preventDefault();
      thisDialog = $(this).closest('[data-js-dialog]');
      CM.lib.dialog.closeDialog(thisDialog, onClose);
    });
  }
};

CM.lib.pageSectionNav = {
  $sectionPills: null,
  sectionTops: [],
  currentClass: 'c-page-section-nav__section--state-current',
  scrollOffset: 0,
  setCurrentSection: function() {
    var currentSectionIndex;
    currentSectionIndex = CM.lib.pageSectionNav.sectionTops.slice(0, CM.lib.pageSectionNav.sectionTops.findIndex(function(yPosition) {
      return yPosition > window.pageYOffset - CM.lib.pageSectionNav.scrollOffset;
    })).length;
    CM.lib.pageSectionNav.$sectionPills.removeClass(CM.lib.pageSectionNav.currentClass);
    CM.lib.pageSectionNav.$sectionPills[currentSectionIndex].classList.add(CM.lib.pageSectionNav.currentClass);
  },
  initialise: function() {
    CM.lib.pageSectionNav.$sectionPills = $('[data-js-page-section-nav-option]');
    CM.lib.pageSectionNav.scrollOffset = parseInt($('[data-js-page-section-nav]').data('jsPageSectionNav') | 0);
    CM.lib.pageSectionNav.$sectionPills.each(function() {
      var thisSectionPill;
      thisSectionPill = $(this);
      CM.lib.pageSectionNav.sectionTops.push($(thisSectionPill.attr('href')).position().top);
    });
    document.addEventListener('scroll', (function() {
      CM.lib.pageSectionNav.setCurrentSection();
    }), {
      passive: true
    });
    CM.lib.pageSectionNav.setCurrentSection();
  }
};

CM.lib.scrollPrompt = {
  hideClass: 'a-scroll-prompt--state-hidden',
  $dom: null,
  $hideAt: null,
  initialise: function() {
    var hideAtIntersectionObserver;
    CM.lib.scrollPrompt.$dom = $('[data-js-scroll-prompt]');
    CM.lib.scrollPrompt.$hideAt = $(CM.lib.scrollPrompt.$dom.data('js-hide-at'));
    hideAtIntersectionObserver = new IntersectionObserver((function(entries) {
      if (entries[0].isIntersecting) {
        CM.lib.scrollPrompt.$dom.addClass(CM.lib.scrollPrompt.hideClass);
        hideAtIntersectionObserver.unobserve(CM.lib.scrollPrompt.$hideAt[0]);
      }
    }), {});
    return hideAtIntersectionObserver.observe(CM.lib.scrollPrompt.$hideAt[0]);
  }
};

CM.lib.scroller = {
  cssClasses: {
    hideScrollerEnd: 'm-scroller-end--appearance-hidden'
  },
  dataAttributes: {
    jumpLink: '*[data-scroller-jump]',
    scrollerTop: '*[data-scroller-top]',
    scrollerBottom: '*[data-scroller-bottom]',
    scrollerBottomDefault: 'scroller-jump-bottom'
  },
  adjustScrollIcons: function($container) {
    var containerHeight, currentScroll, maxScroll, thisPane;
    maxScroll = Math.ceil($container[0].scrollHeight);
    currentScroll = $container.scrollTop();
    thisPane = $('#' + $container.data('scroller-list'));
    containerHeight = Math.ceil($container.height());
    if (maxScroll > containerHeight) {
      if (currentScroll === 0) {
        $(CM.lib.scroller.dataAttributes.scrollerTop, thisPane).addClass(CM.lib.scroller.cssClasses.hideScrollerEnd);
        return $(CM.lib.scroller.dataAttributes.scrollerBottom, thisPane).removeClass(CM.lib.scroller.cssClasses.hideScrollerEnd);
      } else if (Math.ceil((currentScroll + containerHeight) >= maxScroll)) {
        $(CM.lib.scroller.dataAttributes.scrollerBottom, thisPane).addClass(CM.lib.scroller.cssClasses.hideScrollerEnd);
        return $(CM.lib.scroller.dataAttributes.scrollerTop, thisPane).removeClass(CM.lib.scroller.cssClasses.hideScrollerEnd);
      } else {
        $(CM.lib.scroller.dataAttributes.scrollerBottom, thisPane).removeClass(CM.lib.scroller.cssClasses.hideScrollerEnd);
        return $(CM.lib.scroller.dataAttributes.scrollerTop, thisPane).removeClass(CM.lib.scroller.cssClasses.hideScrollerEnd);
      }
    } else {
      $(CM.lib.scroller.dataAttributes.scrollerTop, thisPane).addClass(CM.lib.scroller.cssClasses.hideScrollerEnd);
      return $(CM.lib.scroller.dataAttributes.scrollerBottom, thisPane).addClass(CM.lib.scroller.cssClasses.hideScrollerEnd);
    }
  },
  jumpLinks: function() {
    return $(CM.lib.scroller.dataAttributes.jumpLink).on('click', function(ev) {
      var scrollBottom, thisJump, thisJumpBottom, thisJumpList, thisList;
      ev.preventDefault();
      thisJump = $(this);
      thisJumpList = thisJump.data('scroller-jump-list');
      thisList = $('*[data-scroller-list="' + thisJumpList + '"]');
      scrollBottom = thisList[0].scrollHeight;
      thisJumpBottom = thisJump.data(CM.lib.scroller.dataAttributes.scrollerBottomDefault);
      if (thisJumpBottom != null) {
        scrollBottom = thisJumpBottom;
      }
      if (thisJump.data('scroller-jump') === 'top') {
        return thisList.scrollTop(0);
      } else {
        return thisList.scrollTop(scrollBottom);
      }
    });
  }
};

CM.lib.tabs = {
  switchTabs: function(showTabSelector, hideTabSelectors, hiddenClass) {
    var hideTab, i, len, selector;
    if (hideTabSelectors == null) {
      hideTabSelectors = [];
    }
    if (hiddenClass == null) {
      hiddenClass = CM.lib.constants.HIDE_CLASS;
    }
    hideTab = function(selector) {
      return $(selector).addClass(hiddenClass);
    };
    if (Array.isArray(hideTabSelectors)) {
      for (i = 0, len = hideTabSelectors.length; i < len; i++) {
        selector = hideTabSelectors[i];
        hideTab(selector);
      }
    } else {
      hideTab(hideTabSelectors);
    }
    return $(showTabSelector).removeClass(hiddenClass);
  }
};

CM.lib.wizard = {
  cssClasses: {
    activeSlide: 'm-wizard__slide--state-active',
    activeMenuOption: 'm-wizard__menu-item--state-active'
  },
  dataAttributes: {
    wizard: '*[data-js-wizard]',
    wizardMenu: '*[data-js-wizard-menu]',
    wizardMenuSlide: '*[data-js-wizard-menu-slide]',
    wizardNextSlide: '*[data-js-wizard-next-slide]',
    wizardSlides: '*[data-js-wizard-slide]'
  },
  events: {
    slideChange: 'slideChange'
  },
  getCurrentSlideNumber: function(wizard) {
    return $('.' + CM.lib.wizard.cssClasses.activeSlide, wizard).data('js-wizard-slide');
  },
  goToSlide: function(wizard, slideNumber) {
    $(CM.lib.wizard.dataAttributes.wizardSlides, wizard).removeClass(CM.lib.wizard.cssClasses.activeSlide);
    $(CM.lib.wizard.dataAttributes.wizardMenuSlide, wizard).removeClass(CM.lib.wizard.cssClasses.activeMenuOption);
    $("*[data-js-wizard-slide='" + slideNumber + "']", wizard).addClass(CM.lib.wizard.cssClasses.activeSlide);
    $("*[data-js-wizard-menu-slide='" + slideNumber + "']", wizard).addClass(CM.lib.wizard.cssClasses.activeMenuOption);
    return $(CM.lib.wizard.dataAttributes.wizard).trigger(CM.lib.wizard.events.slideChange, [slideNumber]);
  },
  initialise: function() {
    return $('*[data-js-wizard]').each(function() {
      var initSlideNumber, menuDom, thisWizard, wizardMenu, wizardSlides;
      thisWizard = $(this);
      wizardMenu = $(CM.lib.wizard.dataAttributes.wizardMenu, thisWizard);
      wizardSlides = $(CM.lib.wizard.dataAttributes.wizardSlides, thisWizard);
      menuDom = '';
      initSlideNumber = CM.lib.wizard.getCurrentSlideNumber(thisWizard);
      wizardSlides.each(function() {
        var activeSlideClass, thisSlide, thisSlideNumber, thisSlideTest, thisSlideTitle;
        thisSlide = $(this);
        thisSlideTitle = thisSlide.data('js-wizard-slide-title');
        thisSlideTest = thisSlide.data('js-wizard-slide-test');
        thisSlideNumber = thisSlide.data('js-wizard-slide');
        activeSlideClass = initSlideNumber === thisSlideNumber ? ' ' + CM.lib.wizard.cssClasses.activeMenuOption : '';
        return menuDom += "<a href='#' class='m-wizard__menu-item" + activeSlideClass + "' data-js-wizard-menu-slide='" + thisSlideNumber + "' data-test='wizard-menu-" + thisSlideTest + "'>" + thisSlideTitle + "</a>";
      });
      wizardMenu.html(menuDom);
      $(CM.lib.wizard.dataAttributes.wizardMenuSlide, thisWizard).on('click', function(ev) {
        var thisSlideNumber;
        ev.preventDefault();
        thisSlideNumber = $(this).data('js-wizard-menu-slide');
        return CM.lib.wizard.goToSlide(thisWizard, thisSlideNumber);
      });
      return $(CM.lib.wizard.dataAttributes.wizardNextSlide).on('click', function(ev) {
        var nextSlide;
        ev.preventDefault();
        nextSlide = CM.lib.wizard.getCurrentSlideNumber(thisWizard) + 1;
        return CM.lib.wizard.goToSlide(thisWizard, nextSlide);
      });
    });
  }
};

CM.accountCreation = {
  emailTakenError: false,
  formSelector: null,
  initialise: function() {
    return $(document).ready((function(_this) {
      return function() {
        CM.accountCreation.formSelector = '#create-email-form';
        _this.handleTracking();
        CM.global.listenForm(CM.accountCreation);
        CM.captcha.validate(CM.accountCreation.formSelector);
        return CM.dateEntry.initialise();
      };
    })(this));
  },
  handleTracking: function() {
    var gaEvent;
    CM.accountCreation.emailTakenError = emailTakenError || false;
    if (CM.accountCreation.emailTakenError) {
      gaEvent = ['Account email already taken'];
      return CM.global.sendGaEvents(gaEvent, 'account-creation', false, true);
    }
  }
};

CM.setsnalogin = {
  formSelector: null,
  initialise: function() {
    return $(document).ready((function(_this) {
      return function() {
        CM.setsnalogin.formSelector = '#set-sna-form';
        CM.global.listenForm(CM.setsnalogin);
        return CM.captcha.validate(CM.setsnalogin.formSelector);
      };
    })(this));
  }
};

CM.accountRecovery = {
  dataAttributeSelectors: {
    backToEmailLink: 'back-to-email-link',
    checkEmailTab: 'check-email-page',
    emailDidNotArrive: 'email-did-not-arrive-link',
    hiddenPassword: '*[data-password-wrapper].' + CM.lib.constants.HIDE_CLASS,
    noEmailTab: 'no-email-page'
  },
  emailTabs: function(pageObj) {
    if (pageObj == null) {
      pageObj = CM.accountRecovery;
    }
    $("[data-js='" + pageObj.dataAttributeSelectors.emailDidNotArrive + "']").on('click', function(ev) {
      ev.preventDefault();
      return CM.lib.tabs.switchTabs("[data-js='" + pageObj.dataAttributeSelectors.noEmailTab + "']", "[data-js='" + pageObj.dataAttributeSelectors.checkEmailTab + "']");
    });
    return $("[data-js='" + pageObj.dataAttributeSelectors.backToEmailLink + "']").on('click', function(ev) {
      ev.preventDefault();
      return CM.lib.tabs.switchTabs("[data-js='" + pageObj.dataAttributeSelectors.checkEmailTab + "']", "[data-js='" + pageObj.dataAttributeSelectors.noEmailTab + "']");
    });
  },
  paymentTypeChanges: function() {
    var $earliestSubWrapper, $paymentTypeField, $paymentWrapper, $transactionIdWrapper, paymentPaypalType, paymentType;
    $paymentTypeField = $('#paymenttype');
    $paymentWrapper = $('#payment-details-wrapper');
    $earliestSubWrapper = $('#billing_earliestsubs');
    $transactionIdWrapper = $('#transaction-id-wrapper');
    paymentPaypalType = '6';
    paymentType = $paymentTypeField.val();
    $('*[data-type-group]').css('display', 'none');
    if (paymentType && paymentType !== '0') {
      $('*[data-type-group-' + paymentType + ']').each(function() {
        var thisTypeGroup;
        thisTypeGroup = $(this);
        if (thisTypeGroup.data('type-group') === 'inline') {
          return thisTypeGroup.css('display', 'inline');
        } else {
          return thisTypeGroup.css('display', 'block');
        }
      });
      if (paymentType === paymentPaypalType && (parseInt($('#earliestsubsyear').val()) < 2009 && parseInt($('#earliestsubsmonth').val()) < 12)) {
        $transactionIdWrapper.css('display', 'none');
      } else {
        $transactionIdWrapper.css('display', 'block');
      }
      $earliestSubWrapper.css('display', 'block');
      return $paymentWrapper.slideDown();
    } else {
      $earliestSubWrapper.css('display', 'none');
      return $paymentWrapper.slideUp();
    }
  },
  showStates: function(countryDropDown) {
    var stateDropdown, stateDropdownId;
    stateDropdownId = countryDropDown.data('state');
    stateDropdown = $('#' + stateDropdownId);
    if (countryDropDown.val() === usCountryCode) {
      return stateDropdown.css('display', 'block');
    } else {
      return stateDropdown.css('display', 'none');
    }
  },
  manualInit: function() {
    var addPasswordLink, countryStateBoxes, movedHouseToggle, recoveryToggle;
    recoveryToggle = function() {
      var readOnly;
      readOnly = false;
      if ($('*[data-recovery-toggle]').is(':checked')) {
        return $('#recovery-answer-container').stop().slideUp();
      } else {
        return $('#recovery-answer-container').stop().slideDown();
      }
    };
    movedHouseToggle = function() {
      if ($('#moved_house_yes').is(':checked')) {
        return $('#house-move-answers-container').stop().slideDown();
      } else {
        return $('#house-move-answers-container').stop().slideUp();
      }
    };
    $('*[data-recovery-toggle]').on('click', recoveryToggle);
    $('#house-move-radio-container').on('change', movedHouseToggle);
    $('#paymenttype').on('change', function() {
      return CM.accountRecovery.paymentTypeChanges();
    });
    $('#earliestsubsmonth').on('change', function() {
      return CM.accountRecovery.paymentTypeChanges();
    });
    $('#earliestsubsyear').on('change', function() {
      return CM.accountRecovery.paymentTypeChanges();
    });
    countryStateBoxes = $('*[data-state]');
    countryStateBoxes.on('change', function() {
      return CM.accountRecovery.showStates($(this));
    });
    countryStateBoxes.each(function() {
      return CM.accountRecovery.showStates($(this));
    });
    addPasswordLink = $('#add-password');
    addPasswordLink.on('click', function(ev) {
      ev.preventDefault();
      $(CM.accountRecovery.dataAttributeSelectors.hiddenPassword + ':first').removeClass(CM.lib.constants.HIDE_CLASS);
      if ($(CM.accountRecovery.dataAttributeSelectors.hiddenPassword).length === 0) {
        return addPasswordLink.remove();
      }
    });
    this.paymentTypeChanges();
    CM.lib.characterCounter.initialise();
    recoveryToggle();
    return movedHouseToggle();
  },
  accountIdentified: function() {
    if (redirectStr === '') {
      return this.initialise();
    } else {
      return CM.global.sendGaEvents(gaEvents, 'Account Recovery', function() {
        return CM.global.redirectUser(redirectStr);
      });
    }
  },
  setRecoverFromGame: function() {
    var cookieExpire;
    cookieExpire = new Date(Date.now() + 1800000);
    return CM.lib.cookies.set('necessary', 'account-appeal__requested-game-recovery', 'requested', cookieExpire);
  },
  getRecoverFromGame: function() {
    if (Cookies.get('account-appeal__requested-game-recovery')) {
      if (typeof gaEvents !== "undefined" && gaEvents !== null) {
        return gaEvents.push('Started appeal process after game prompt');
      }
    }
  },
  initialise: function() {
    return $(document).ready((function(_this) {
      return function() {
        if (typeof gaEvents !== "undefined" && gaEvents !== null) {
          CM.global.sendGaEvents(gaEvents, 'Account Recovery', false, true);
        }
        return CM.global.listenForm();
      };
    })(this));
  }
};

CM.account = {
  linkedAccounts: {
    initialise: function() {
      return $('*[data-js-facebook-login]').on('click', function(ev) {
        ev.preventDefault();
        if (FB.getAuthResponse() === null || typeof FB.getAuthResponse() === 'undefined') {
          if (getWebScriptPermissions) {
            return FB.login(function(response) {
              if (response.authResponse) {
                return fbLoginRedirect();
              }
            }, {
              scope: getWebScriptPermissions
            });
          } else {
            return FB.login(function(response) {
              if (response.authResponse) {
                return fbLoginRedirect();
              }
            });
          }
        } else {
          return fbLoginRedirect();
        }
      });
    }
  }
};

CM.adventurersLog = {
  initialPrivacyOption: null,
  dataAttributeSelectors: {
    privacyOptions: '*[data-profile-setting]'
  },
  idSelectors: {
    submitForm: '#change-settings'
  },
  settings: function() {
    CM.global.listenForm();
    CM.adventurersLog.initialPrivacyOption = $(CM.adventurersLog.dataAttributeSelectors.privacyOptions + ':checked').val();
    return $(CM.adventurersLog.dataAttributeSelectors.privacyOptions).on('change', function() {
      if ($(CM.adventurersLog.dataAttributeSelectors.privacyOptions + ':checked').val() === CM.adventurersLog.initialPrivacyOption) {
        return $($(CM.adventurersLog.idSelectors.submitForm)).prop('disabled', true);
      } else {
        return $($(CM.adventurersLog.idSelectors.submitForm)).prop('disabled', false);
      }
    });
  }
};

CM.authenticator = {
  slide: {
    get: 1,
    scan: 2,
    enter: 3
  },
  cssClasses: {
    phoneChanging: 'ua-authenticator-phone--state-changing'
  },
  dataAttributes: {
    phone: '*[data-js-authenticator-phone]',
    qrCode: '*[data-js-qr-code]',
    enterAuthCode: '*[data-js-enter-code]'
  },
  enable: function() {
    var authenticatorPhone;
    CM.lib.wizard.initialise();
    CM.global.listenForm();
    $(CM.lib.wizard.dataAttributes.wizard).on(CM.lib.wizard.events.slideChange, function(ev, slideNumber) {
      if (slideNumber === CM.authenticator.slide.scan) {
        return $(CM.lib.wizard.dataAttributes.wizardMenuSlide).focus();
      } else if (slideNumber === CM.authenticator.slide.enter) {
        return $(CM.authenticator.dataAttributes.enterAuthCode).focus();
      }
    });
    $(CM.authenticator.dataAttributes.qrCode).qrcode({
      'text': 'otpauth://totp/Jagex:' + displayName + '?secret=' + key + '&issuer=Jagex',
      'width': '225',
      'height': '225',
      'render': 'canvas'
    });
    authenticatorPhone = $(CM.authenticator.dataAttributes.phone);
    return setInterval((function() {
      authenticatorPhone.addClass(CM.authenticator.cssClasses.phoneChanging);
      return setTimeout((function() {
        var newNumber;
        newNumber = Math.floor(Math.random() * 900000) + 100000;
        authenticatorPhone.attr('data-js-code', newNumber);
        return authenticatorPhone.removeClass(CM.authenticator.cssClasses.phoneChanging);
      }), 2000);
    }), 7000);
  }
};

CM.captcha = {
  cssClasses: {
    recaptchaVisibleClass: 'c-google-recaptcha-error--visibility-show'
  },
  validate: function(formSelector, recaptchaSelector, pageObj) {
    var $listenedForm;
    if (recaptchaSelector == null) {
      recaptchaSelector = '#google-recaptcha';
    }
    if (pageObj == null) {
      pageObj = CM.captcha;
    }
    $listenedForm = $(formSelector);
    return $listenedForm.on('submit', function(ev) {
      var $recaptcha;
      $recaptcha = $(recaptchaSelector + '-response-custom');
      if ($recaptcha.length) {
        if ($recaptcha.val() === '') {
          ev.preventDefault();
          $listenedForm.trigger('forminvalid.zf.abide');
          return $(recaptchaSelector + '-error').addClass(pageObj.cssClasses.recaptchaVisibleClass);
        } else {
          return $(recaptchaSelector + '-error').removeClass(pageObj.cssClasses.recaptchaVisibleClass);
        }
      }
    });
  }
};

CM.characterName = {
  ajaxNameCheckUrl: null,
  characterNameValid: false,
  characterNameField: null,
  characterNameLabel: null,
  confirmPopup: false,
  currentName: null,
  formSelector: '#character-name-form',
  typingTimeout: 300,
  cssClasses: {
    checkerChecking: 'a-label--checker-checking',
    checkerDone: 'a-label--checker-checking-done',
    invalidInput: 'is-invalid-input',
    isVisible: 'is-visible',
    sectionHiddenClass: 'uc-confirm-form--display-none'
  },
  dataAttributeSelectors: {
    backButton: '*[data-js="back-btn"]',
    characterNameEntry: '*[data-js="character-name-entry"]',
    characterNameConfirm: '*[data-js="character-name-confirm"]',
    characterNameHidden: '*[data-js="character-name-hidden"]',
    confirmForm: '*[data-js="confirm-form"]',
    setForm: '*[data-js="set-form"]',
    setSubmit: '*[data-js="set-submit"]',
    nameError: '*[data-js="name-error"]'
  },
  initialise: function() {
    CM.characterName.ajaxNameCheckUrl = ajaxNameCheckUrl;
    CM.characterName.currentName = currentName;
    return $(document).ready((function(_this) {
      return function() {
        CM.characterName.characterNameField = $('#character-name');
        CM.characterName.characterNameLabel = $('#character-name-label');
        CM.characterName.listenForm();
        if (CM.characterName.characterNameField.length) {
          return CM.characterName.nameInputCheck();
        }
      };
    })(this));
  },
  ajaxNameCheck: function(characterName, pageObj) {
    var ajaxUrl;
    if (characterName == null) {
      characterName = CM.characterName.characterNameField.val();
    }
    if (pageObj == null) {
      pageObj = CM.characterName;
    }
    ajaxUrl = "https://secure.runescape.com/m=displaynames/check_name.ws?displayname=" + characterName;
    if ((pageObj.ajaxNameCheckUrl != null) && pageObj.ajaxNameCheckUrl !== null) {
      ajaxUrl = pageObj.ajaxNameCheckUrl + characterName;
    }
    return $.ajax({
      url: ajaxUrl,
      success: function(response) {
        return CM.characterName.handleNameResults(response);
      },
      error: function() {
        return CM.characterName.handleNameResults('ERROR');
      }
    });
  },
  handleNameResults: function(response, pageObj) {
    if (pageObj == null) {
      pageObj = CM.characterName;
    }
    if (response.match(/^NOK/)) {
      pageObj.characterNameValid = false;
      pageObj.characterNameField.addClass(pageObj.cssClasses.invalidInput);
      $(CM.characterName.dataAttributeSelectors.setSubmit).prop('disabled', true);
      pageObj.characterNameLabel.removeClass(pageObj.cssClasses.checkerChecking);
      if (pageObj.characterNameField.val()) {
        return pageObj.characterNameLabel.find(pageObj.dataAttributeSelectors.nameError).addClass(pageObj.cssClasses.isVisible);
      }
    } else {
      pageObj.characterNameValid = true;
      pageObj.characterNameLabel.addClass(pageObj.cssClasses.checkerDone);
      pageObj.characterNameField.removeClass(pageObj.cssClasses.invalidInput);
      $(CM.characterName.dataAttributeSelectors.setSubmit).prop('disabled', false);
      pageObj.characterNameLabel.find(pageObj.dataAttributeSelectors.nameError).removeClass(pageObj.cssClasses.isVisible);
      pageObj.characterNameLabel.one('webkitAnimationEnd msAnimationEnd animationend', function() {
        return pageObj.characterNameLabel.removeClass(pageObj.cssClasses.checkerChecking + " " + pageObj.cssClasses.checkerDone);
      });
      if (!response.match(/^OK/)) {
        return pageObj.characterNameLabel.removeClass(pageObj.cssClasses.checkerChecking);
      }
    }
  },
  listenForm: function(pageObj) {
    if (pageObj == null) {
      pageObj = CM.characterName;
    }
    $(CM.characterName.dataAttributeSelectors.setForm).on('submit', function(ev) {
      ev.preventDefault();
      if (pageObj.characterNameValid) {
        return CM.characterName.showConfirmForm();
      } else {
        return pageObj.validateNameField(pageObj);
      }
    });
    return $(CM.characterName.dataAttributeSelectors.backButton).on('click', function(ev) {
      ev.preventDefault();
      return CM.characterName.showSetForm();
    });
  },
  showConfirmForm: function() {
    var newName;
    $(CM.characterName.dataAttributeSelectors.setForm).addClass(CM.lib.constants.HIDE_CLASS);
    $(CM.characterName.dataAttributeSelectors.confirmForm).removeClass(CM.characterName.cssClasses.sectionHiddenClass);
    newName = $(CM.characterName.dataAttributeSelectors.characterNameEntry).val();
    $(CM.characterName.dataAttributeSelectors.characterNameHidden).val(newName);
    return $(CM.characterName.dataAttributeSelectors.characterNameConfirm).text(newName);
  },
  showSetForm: function() {
    $(CM.characterName.dataAttributeSelectors.setForm).removeClass(CM.lib.constants.HIDE_CLASS);
    $(CM.characterName.dataAttributeSelectors.confirmForm).addClass(CM.characterName.cssClasses.sectionHiddenClass);
    $(CM.characterName.dataAttributeSelectors.characterNameHidden).val('');
    return $(CM.characterName.dataAttributeSelectors.characterNameConfirm).text('');
  },
  nameInputCheck: function(pageObj) {
    var inputValidate, requestedName, timeout;
    if (pageObj == null) {
      pageObj = CM.characterName;
    }
    requestedName = pageObj.characterNameField.val();
    pageObj.characterNameLabel.removeClass(pageObj.cssClasses.checkerDone);
    timeout = null;
    pageObj.validateNameField();
    inputValidate = function() {
      if (requestedName !== pageObj.characterNameField.val()) {
        pageObj.characterNameValid = false;
        pageObj.validateNameField();
        return requestedName = pageObj.characterNameField.val();
      }
    };
    return pageObj.characterNameField.on('keyup change', function() {
      clearTimeout(timeout);
      $(CM.characterName.dataAttributeSelectors.setSubmit).prop('disabled', true);
      if (pageObj.characterNameField.val().length > 0) {
        pageObj.characterNameField.removeClass(pageObj.cssClasses.invalidInput);
        pageObj.characterNameLabel.find(pageObj.dataAttributeSelectors.nameError).removeClass(pageObj.cssClasses.isVisible);
        $(CM.characterName.dataAttributeSelectors.setSubmit).prop('disabled', false);
      }
      return timeout = setTimeout(inputValidate, pageObj.typingTimeout);
    });
  },
  validateNameField: function(pageObj) {
    var characterName;
    if (pageObj == null) {
      pageObj = CM.characterName;
    }
    pageObj.characterNameLabel.removeClass(pageObj.cssClasses.checkerDone);
    pageObj.characterNameLabel.addClass(pageObj.cssClasses.checkerChecking);
    characterName = pageObj.characterNameField.val();
    if ((characterName != null) && characterName !== '') {
      return pageObj.ajaxNameCheck(characterName, pageObj);
    } else {
      return pageObj.handleNameResults('NOK');
    }
  }
};

CM.dateEntry = {
  initialise: function() {
    return $('*[data-js-date-entry]').each(function() {
      var allDateFields, errorMessage, thisDateEntry;
      thisDateEntry = $(this);
      allDateFields = $('input', thisDateEntry);
      errorMessage = $('*[data-js-date-entry-error]', thisDateEntry);
      allDateFields.on('invalid.zf.abide', function() {
        return errorMessage.addClass('is-visible');
      });
      return allDateFields.on('change', function() {
        if ($('*[data-invalid]', thisDateEntry).length === 0) {
          return errorMessage.removeClass('is-visible');
        }
      });
    });
  }
};

CM.dob = {
  minimumDateVal: null,
  thisDateEntry: $('*[data-js-date-entry]'),
  dobErrorMessage: $('span[data-minimum-date-error]'),
  dobSubmitted: function() {
    if (redirectStr === '') {
      return this.initialise();
    } else {
      return CM.global.sendGaEvents(gaEvents, 'DOB', function() {
        return CM.global.redirectUser(redirectStr);
      });
    }
  },
  isDateAboveMinimum: function() {
    var dateStr, thisDateDay, thisDateMonth, thisDateYear, timeStr;
    thisDateYear = $('*[data-date-year]', CM.dob.thisDateEntry).val();
    thisDateMonth = $('*[data-date-month]', CM.dob.thisDateEntry).val();
    thisDateDay = $('*[data-date-day]', CM.dob.thisDateEntry).val();
    if (thisDateYear !== "" && thisDateMonth !== "" && thisDateDay !== "") {
      dateStr = new Date(thisDateYear + "-" + thisDateMonth + "-" + thisDateDay);
      timeStr = dateStr.getTime();
      if (CM.dob.minimumDateVal > timeStr) {
        return true;
      }
    }
    return false;
  },
  initialise: function() {
    return $(document).ready((function(_this) {
      return function() {
        if (typeof gaEvents !== "undefined" && gaEvents !== null) {
          CM.global.sendGaEvents(gaEvents, 'DOB');
        }
        CM.global.listenForm();
        CM.dateEntry.initialise();
        if (typeof minimumDate !== "undefined" && minimumDate !== null) {
          CM.dob.minimumDateVal = minimumDate;
        }
        if (CM.dob.minimumDateVal !== null) {
          $('input', CM.dob.thisDateEntry).on('change', function() {
            var numberOfEmptyFields;
            numberOfEmptyFields = $('input:empty', CM.dob.thisDateEntry).filter(function() {
              return $(this).val() === '';
            }).length;
            if ($('*[data-invalid]', CM.dob.thisDateEntry).length > 0 || numberOfEmptyFields > 0) {
              return CM.dob.dobErrorMessage.hide();
            } else if (CM.dob.isDateAboveMinimum()) {
              return CM.dob.dobErrorMessage.hide();
            } else {
              CM.dob.dobErrorMessage.css("display", "block");
              return $('#dob_form').foundation('addErrorClasses', $('*[data-date]', CM.dob.thisDateEntry));
            }
          });
          return $('#dob_form').on('submit', function(ev) {
            if ($('*[data-invalid]', CM.dob.thisDateEntry).length === 0) {
              if (CM.dob.isDateAboveMinimum()) {
                return CM.dob.dobErrorMessage.hide();
              } else {
                ev.preventDefault();
                CM.dob.dobErrorMessage.css("display", "block");
                $('#dob_form').foundation('addErrorClasses', $('*[data-date]', CM.dob.thisDateEntry));
                $('#l-vista__container').addClass('l-vista__container--style-attention');
                return false;
              }
            } else {
              return CM.dob.dobErrorMessage.hide();
            }
          });
        }
      };
    })(this));
  }
};

CM.download = {
  game: '',
  binaryPrefixUnits: ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"],
  downloadContent: $('[data-js-download-content]'),
  downloadButton: $('#download'),
  allDownloadButtons: $('[data-download-btn]'),
  downloadDetectedOs: $('#download-detected-os'),
  mebibyte: 1024 * 1024,
  linuxDialog: $('#linux-instructions'),
  macDialog: $('#mac-instructions'),
  bodyElement: $('#p-download'),
  windowsDownloadSizeDisplay: $('#download-size-win-display'),
  macDownloadSizeDisplay: $('#download-size-mac-display'),
  gaEventAct: 'RuneScape Game Client',
  gaEventCat: 'Download',
  toBinaryPrefixFormat: function(bytes, decimals) {
    var dm, i, k;
    if (decimals == null) {
      decimals = 2;
    }
    if (bytes === 0) {
      return "0 " + CM.download.binaryPrefixUnits[0];
    }
    k = 1024;
    dm = decimals < 0 ? 0 : decimals;
    i = Math.floor(Math.log(bytes) / Math.log(k));
    return (parseFloat((bytes / Math.pow(k, i)).toFixed(dm))) + " " + CM.download.binaryPrefixUnits[i];
  },
  linkTracking: function(operatingSystem, url) {
    CM.global.sendGaEvents([CM.download.gaEventAct], CM.download.gaEventCat, (function() {
      CM.download.forwardToAddress(operatingSystem, url);
    }), false, 3000, operatingSystem);
  },
  forwardToAddress: function(operatingSystem, url) {
    if (operatingSystem !== "Linux") {
      location.href = url;
    }
  },
  getDetails: function() {
    $.getJSON(baseContentUrl + '/downloads-info/windows/RuneScape-Setup.exe.json', function(data) {
      var windowsDownloadUrl;
      windowsDownloadUrl = windowsDownloadUrl + '?crc=' + data.crc;
      $(CM.download.windowsDownloadSizeDisplay).append(CM.download.toBinaryPrefixFormat(data.size, 2));
      $(CM.download.windowsDownloadSizeDisplay).show();
      $('[data-download-btn="win"]').attr('href', windowsDownloadUrl);
    });
    return $.getJSON(baseContentUrl + '/downloads-info/osx/RuneScape.dmg.json', function(data) {
      var macDownloadUrl;
      macDownloadUrl = macDownloadUrl + '?crc=' + data.crc;
      $(CM.download.macDownloadSizeDisplay).append(CM.download.toBinaryPrefixFormat(data.size, 2));
      $(CM.download.macDownloadSizeDisplay).show();
      $('[data-download-btn="win"]').attr('mac', macDownloadUrl);
    });
  },
  initialise: function(game) {
    return $(document).ready((function(_this) {
      return function() {
        var onCloseDialog;
        JXGLOBAL.user.agent.init();
        CM.download.game = game;
        onCloseDialog = function() {
          CM.download.bodyElement.css('user-select', '');
        };
        CM.lib.dialog.initialise(onCloseDialog);
        if (CM.download.game === 'oldschool') {
          CM.download.downloadButton = $('#download-os');
          CM.download.gaEventAct = 'Oldschool Runescape Game Client';
          $(CM.download.windowsDownloadSizeDisplay).append(CM.download.toBinaryPrefixFormat(winClientSize, 2));
          $(CM.download.windowsDownloadSizeDisplay).show();
          $(CM.download.macDownloadSizeDisplay).append(CM.download.toBinaryPrefixFormat(macClientSize, 2));
          $(CM.download.macDownloadSizeDisplay).show();
        } else {
          CM.download.getDetails();
        }
        CM.download.allDownloadButtons.on('click', function(ev) {
          var operatingSystem, thisLink, url;
          ev.preventDefault();
          thisLink = $(this);
          operatingSystem = thisLink.data("download-btn");
          url = thisLink.attr("href");
          if (operatingSystem === "Linux") {
            CM.lib.dialog.openDialog(CM.download.linuxDialog);
            CM.download.bodyElement.css('user-select', 'none');
          } else if (operatingSystem === "Mac" && CM.download.game === "oldschool") {
            CM.lib.dialog.openDialog(CM.download.macDialog);
          }
          CM.download.linkTracking(operatingSystem, url);
        });
        $('#not-your-os').on('click', function() {
          CM.global.sendGaEvents(['User said OS was incorrect'], CM.download.gaEventCat, false, false, 0, JXGLOBAL.user.agent.os);
        });
        switch (JXGLOBAL.user.agent.os) {
          case 'iOS':
            CM.download.downloadButton.attr('href', operatingSystems.ios.url);
            CM.download.downloadButton.data('download-btn', operatingSystems.ios.name);
            CM.download.downloadDetectedOs.text(operatingSystems.ios.name);
            break;
          case 'Android':
            CM.download.downloadButton.attr('href', operatingSystems.and.url);
            CM.download.downloadButton.data('download-btn', operatingSystems.and.name);
            CM.download.downloadDetectedOs.text(operatingSystems.and.name);
            break;
          case 'Mac OS':
            CM.download.downloadButton.attr('href', operatingSystems.mac.url);
            CM.download.downloadButton.attr('download', CM.download.game + "." + operatingSystems.mac.fileExtension);
            CM.download.downloadButton.data('download-btn', operatingSystems.mac.name);
            CM.download.downloadDetectedOs.text(operatingSystems.mac.name);
            break;
          case 'Debian':
          case 'Linux':
          case 'Ubuntu':
            if (operatingSystems.lin.url != null) {
              CM.download.downloadButton.attr('href', operatingSystems.lin.url);
              CM.download.downloadButton.data('download-btn', operatingSystems.lin.name);
              CM.download.downloadDetectedOs.text(operatingSystems.lin.name);
            } else {
              CM.download.downloadButton.attr('href', operatingSystems.win.url);
              CM.download.downloadButton.attr('download', CM.download.game + "." + operatingSystems.win.fileExtension);
              CM.download.downloadButton.data('download-btn', operatingSystems.win.name);
              CM.download.downloadDetectedOs.text(operatingSystems.win.name);
            }
            break;
          case 'Windows':
            CM.download.downloadButton.attr('href', operatingSystems.win.url);
            CM.download.downloadButton.attr('download', CM.download.game + "." + operatingSystems.win.fileExtension);
            CM.download.downloadButton.data('download-btn', operatingSystems.win.name);
            CM.download.downloadDetectedOs.text(operatingSystems.win.name);
            break;
          default:
            CM.download.downloadButton.attr('href', operatingSystems.win.url);
            CM.download.downloadButton.attr('download', CM.download.game + "." + operatingSystems.win.fileExtension);
            CM.download.downloadButton.data('download-btn', operatingSystems.win.name);
            CM.download.downloadDetectedOs.text(operatingSystems.win.name);
            CM.global.sendGaEvents(['Detected Operating System Not Supported'], CM.download.gaEventCat, false, true, 0, JXGLOBAL.user.agent.os);
            break;
        }
      };
    })(this));
  }
};

CM.emailRegister = {
  initialise: function() {
    return CM.global.listenForm();
  }
};

CM.launcher = {
  game: '',
  binaryPrefixUnits: ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"],
  downloadContent: $('[data-js-download-content]'),
  downloadButton: $('#download-rs-launcher'),
  allDownloadButtons: $('[data-download-btn]'),
  downloadDetectedOs: $('#download-detected-os'),
  mebibyte: 1024 * 1024,
  linuxDialog: $('#linux-instructions'),
  bodyElement: $('#p-download'),
  windowsDownloadSizeDisplay: $('#download-size-win-display'),
  macDownloadSizeDisplay: $('#download-size-mac-display'),
  gaEventAct: 'RuneScape Launcher',
  gaEventCat: 'Launcher',
  gameTitle: $('#game-title'),
  launcherTitle: $('#launcher-title'),
  toBinaryPrefixFormat: function(bytes, decimals) {
    var dm, i, k;
    if (decimals == null) {
      decimals = 2;
    }
    if (bytes === 0) {
      return "0 " + CM.launcher.binaryPrefixUnits[0];
    }
    k = 1024;
    dm = decimals < 0 ? 0 : decimals;
    i = Math.floor(Math.log(bytes) / Math.log(k));
    return (parseFloat((bytes / Math.pow(k, i)).toFixed(dm))) + " " + CM.launcher.binaryPrefixUnits[i];
  },
  linkTracking: function(operatingSystem, url) {
    CM.global.sendGaEvents([CM.launcher.gaEventAct], CM.launcher.gaEventCat, (function() {
      CM.launcher.forwardToAddress(operatingSystem, url);
    }), false, 3000, operatingSystem);
  },
  forwardToAddress: function(operatingSystem, url) {
    if (operatingSystem !== "Linux") {
      location.href = url;
    }
  },
  getSizes: function() {
    $.ajax({
      type: 'HEAD',
      cache: false,
      url: operatingSystems.win.url,
      success: function(message, text, jqXHR) {
        var size;
        size = parseInt(jqXHR.getResponseHeader('Content-Length'));
        $(CM.launcher.windowsDownloadSizeDisplay).append(CM.launcher.toBinaryPrefixFormat(size, 2));
        $(CM.launcher.windowsDownloadSizeDisplay).show();
      }
    });
    $.ajax({
      type: 'HEAD',
      cache: false,
      url: operatingSystems.mac.url,
      success: function(message, text, jqXHR) {
        var size;
        size = parseInt(jqXHR.getResponseHeader('Content-Length'));
        $(CM.launcher.macDownloadSizeDisplay).append(CM.launcher.toBinaryPrefixFormat(size, 2));
        $(CM.launcher.macDownloadSizeDisplay).show();
      }
    });
  },
  initialise: function(game) {
    return $(document).ready((function(_this) {
      return function() {
        var onCloseDialog;
        JXGLOBAL.user.agent.init();
        CM.launcher.game = game;
        CM.launcher.getSizes();
        onCloseDialog = function() {
          CM.launcher.bodyElement.css('user-select', '');
        };
        CM.lib.dialog.initialise(onCloseDialog);
        if (CM.launcher.game === 'oldschool') {
          CM.launcher.downloadButton = $('#download-os-launcher');
          CM.launcher.gaEventAct = 'Old School Launcher';
        }
        CM.launcher.allDownloadButtons.on('click', function(ev) {
          var operatingSystem, thisLink, url;
          ev.preventDefault();
          thisLink = $(this);
          operatingSystem = thisLink.data("download-btn");
          url = thisLink.attr("href");
          if (operatingSystem === "Linux") {
            CM.lib.dialog.openDialog(CM.launcher.linuxDialog);
            CM.launcher.bodyElement.css('user-select', 'none');
          }
          CM.launcher.linkTracking(operatingSystem, url);
        });
        $('#not-your-os').on('click', function() {
          CM.global.sendGaEvents(['User said OS was incorrect'], CM.launcher.gaEventCat, false, false, 0, JXGLOBAL.user.agent.os);
        });
        switch (JXGLOBAL.user.agent.os) {
          case 'iOS':
            CM.launcher.downloadButton.attr('href', operatingSystems.ios.url);
            CM.launcher.downloadButton.data('download-btn', operatingSystems.ios.name);
            CM.launcher.downloadDetectedOs.text(operatingSystems.ios.name);
            CM.launcher.launcherTitle.remove();
            CM.launcher.gameTitle.show();
            break;
          case 'Android':
            CM.launcher.downloadButton.attr('href', operatingSystems.and.url);
            CM.launcher.downloadButton.data('download-btn', operatingSystems.and.name);
            CM.launcher.downloadDetectedOs.text(operatingSystems.and.name);
            CM.launcher.launcherTitle.remove();
            CM.launcher.gameTitle.show();
            break;
          case 'Mac OS':
            CM.launcher.downloadButton.attr('href', operatingSystems.mac.url);
            CM.launcher.downloadButton.attr('download', CM.launcher.game + "." + operatingSystems.mac.fileExtension);
            CM.launcher.downloadButton.data('download-btn', operatingSystems.mac.name);
            CM.launcher.downloadDetectedOs.text(operatingSystems.mac.name);
            break;
          case 'Debian':
          case 'Linux':
          case 'Ubuntu':
            if (operatingSystems.lin.url != null) {
              CM.launcher.downloadButton.attr('href', operatingSystems.lin.url);
              CM.launcher.downloadButton.data('download-btn', operatingSystems.lin.name);
              CM.launcher.downloadDetectedOs.text(operatingSystems.lin.name);
              CM.launcher.launcherTitle.remove();
              CM.launcher.gameTitle.show();
            } else {
              CM.launcher.downloadButton.attr('href', operatingSystems.win.url);
              CM.launcher.downloadButton.attr('download', CM.launcher.game + "." + operatingSystems.win.fileExtension);
              CM.launcher.downloadButton.data('download-btn', operatingSystems.win.name);
              CM.launcher.downloadDetectedOs.text(operatingSystems.win.name);
            }
            break;
          case 'Windows':
            CM.launcher.downloadButton.attr('href', operatingSystems.win.url);
            CM.launcher.downloadButton.attr('download', CM.launcher.game + "." + operatingSystems.win.fileExtension);
            CM.launcher.downloadButton.data('download-btn', operatingSystems.win.name);
            CM.launcher.downloadDetectedOs.text(operatingSystems.win.name);
            break;
          default:
            CM.launcher.downloadButton.attr('href', operatingSystems.win.url);
            CM.launcher.downloadButton.attr('download', CM.launcher.game + "." + operatingSystems.win.fileExtension);
            CM.launcher.downloadButton.data('download-btn', operatingSystems.win.name);
            CM.launcher.downloadDetectedOs.text(operatingSystems.win.name);
            CM.global.sendGaEvents(['Detected Operating System Not Supported'], CM.launcher.gaEventCat, false, true, 0, JXGLOBAL.user.agent.os);
            break;
        }
      };
    })(this));
  }
};

CM.login = {
  idSelectors: {
    loginForm: '#login-form'
  },
  initialise: function() {
    $(CM.login.idSelectors.loginForm).attr('action', $(CM.login.idSelectors.loginForm).attr('action') + window.location.hash);
    return $(document).ready((function(_this) {
      return function() {
        CM.captcha.validate(CM.login.idSelectors.loginForm);
        return CM.global.listenForm(CM.login);
      };
    })(this));
  }
};

CM.logout = {
  initialise: function() {
    if (typeof homeUrl !== "undefined" && homeUrl !== null) {
      return CM.global.redirectUser(homeUrl);
    }
  }
};

CM.menu = {
  initialise: function() {
    return $(document).ready(function() {
      CM.menu.nav();
      $(window).resize(function() {
        return CM.menu.nav();
      });
      return $('*[data-menu-toggle]').on('click', function() {
        return $(this).next().children('[data-menu-list]').toggleClass('c-menu__nav-list--state-open');
      });
    });
  },
  nav: function() {
    $('*[data-menu-list]').removeClass('c-menu__nav-list--state-open');
    $('*[data-menu]').removeClass('c-menu--style-stacked');
    return $('*[data-menu]').each(function() {
      var $menu, contentWidth, menuWidth;
      $menu = $(this);
      menuWidth = $menu.width();
      contentWidth = 0;
      $menu.children().each(function() {
        if ($(this).is(':visible')) {
          return contentWidth += Math.ceil($(this).width());
        }
      });
      if (contentWidth > menuWidth) {
        return $menu.addClass('c-menu--style-stacked');
      } else {
        return $menu.removeClass('c-menu--style-stacked');
      }
    });
  }
};

CM.ticketing = {
  dataAttributes: {
    dialogueList: '*[data-scroller-list]',
    dialogueListRead: '*[data-scroller-list="read"]',
    dialogueListUnread: '*[data-scroller-list="unread"]'
  },
  dialogue: function() {
    var $conversation, $dialogueList, $lastMessage, $lastMessageHeight, scrollBottomPosition;
    CM.global.listenForm();
    CM.lib.characterCounter.initialise();
    $lastMessage = $('*[data-message]').last();
    $lastMessageHeight = $lastMessage.height();
    $conversation = $('#conversation');
    scrollBottomPosition = $lastMessage.offset().top - ($lastMessageHeight / 2);
    $conversation.scrollTop(scrollBottomPosition);
    $(CM.lib.scroller.dataAttributes.scrollerBottom).data(CM.lib.scroller.dataAttributes.scrollerBottomDefault, scrollBottomPosition);
    $dialogueList = $(CM.ticketing.dataAttributes.dialogueList);
    $dialogueList.scroll(function() {
      return CM.lib.scroller.adjustScrollIcons($dialogueList);
    });
    CM.lib.scroller.adjustScrollIcons($dialogueList);
    return CM.lib.scroller.jumpLinks(scrollBottomPosition);
  },
  inbox: function() {
    var $inboxRead, $inboxUnread;
    $inboxUnread = $(CM.ticketing.dataAttributes.dialogueListUnread);
    $inboxRead = $(CM.ticketing.dataAttributes.dialogueListRead);
    if ($inboxUnread.offsetParent != null) {
      CM.lib.scroller.adjustScrollIcons($inboxUnread);
      CM.lib.scroller.jumpLinks();
      $('#read-label').one('click', function() {
        return CM.lib.scroller.jumpLinks();
      });
    } else {
      CM.lib.scroller.adjustScrollIcons($inboxRead);
      CM.lib.scroller.jumpLinks();
      $('#unread-label').one('click', function() {
        return CM.lib.scroller.jumpLinks();
      });
    }
    $('#message-tabs').on('change.zf.tabs', function() {
      CM.lib.scroller.adjustScrollIcons($inboxRead);
      return CM.lib.scroller.adjustScrollIcons($inboxUnread);
    });
    return $(CM.ticketing.dataAttributes.dialogueList).scroll(function() {
      return CM.lib.scroller.adjustScrollIcons($(this));
    });
  }
};

CM.video = {
  supportsVideoAutoplay: function(callback) {
    var play, video;
    video = document.createElement('video');
    video.paused = true;
    play = 'play' in video && video.play();
    return typeof callback === "function" && callback(!video.paused || 'Promise' in window && play instanceof Promise);
  },
  setVideoSrc: function(format, url) {
    var source;
    source = document.createElement('source');
    source.setAttribute('src', url);
    source.setAttribute('type', format);
    return source;
  },
  init: function() {
    return $(document).ready(function() {
      var videos;
      videos = $('*[data-video]');
      return CM.video.supportsVideoAutoplay(function(supported) {
        if (supported && Foundation.MediaQuery.atLeast('desktop')) {
          return videos.each(function() {
            var video, videoSrc;
            video = $(this);
            videoSrc = video[0];
            video.attr('muted', 'muted');
            video.attr('loop', 'loop');
            video.attr('playsinline', 'playsinline');
            if ((video.data('video-webm') != null) && video.data('video-webm') !== "") {
              video.append(CM.video.setVideoSrc('video/webm', video.data('video-webm')));
            }
            if ((video.data('video-mp4') != null) && video.data('video-mp4') !== "") {
              video.append(CM.video.setVideoSrc('video/mp4', video.data('video-mp4')));
            }
            video.addClass('a-bg-video--visibility-show');
            videoSrc.load();
            videoSrc.play();
            return CM.video.listen(videoSrc);
          });
        } else {
          return videos.remove();
        }
      });
    });
  },
  listen: (function(_this) {
    return function(videoSrc) {
      return $(document).on('visibilitychange', function() {
        return CM.video.update(videoSrc);
      });
    };
  })(this),
  update: function(videoSrc) {
    if (document.hidden && !videoSrc.paused) {
      return videoSrc.pause();
    } else if (!document.hidden && videoSrc.paused) {
      return videoSrc.play();
    }
  }
};

CM.welcomeBack = {
  $learnMoreButton: $('#welcome-back-learn-more'),
  $subscribeButton: $('#welcome-back-subscribe'),
  gaEventCat: 'RuneScape Welcome Back',
  initialise: function(game) {
    $(document).ready((function(_this) {
      return function() {
        if (game === 'oldschool') {
          CM.welcomeBack.gaEventCat = 'Old School RuneScape Welcome Back';
        }
        if (CM.welcomeBack.$subscribeButton.length) {
          CM.global.sendGaEvents(['User loaded page and does not have membership'], CM.welcomeBack.gaEventCat, false, true);
          CM.welcomeBack.$subscribeButton.on('click', function(ev) {
            ev.preventDefault();
            CM.global.sendGaEvents(['User clicked subscribe'], CM.welcomeBack.gaEventCat, (function() {
              location.href = CM.welcomeBack.$subscribeButton.attr('href');
            }), false, 3000);
          });
        } else {
          CM.global.sendGaEvents(['User loaded page and has membership'], CM.welcomeBack.gaEventCat, false, true);
        }
        CM.welcomeBack.$learnMoreButton.on('click', function(ev) {
          ev.preventDefault();
          CM.global.sendGaEvents(['User clicked learn more'], CM.welcomeBack.gaEventCat, (function() {
            location.href = CM.welcomeBack.$learnMoreButton.attr('href');
          }), false, 3000);
        });
      };
    })(this));
  }
};

var OS;

OS = OS || {};

OS.global = {
  initialise: function() {
    var id;
    OS.global.foundation();
    if (typeof gtmId !== "undefined" && gtmId !== null) {
      CM.global.gtmId = gtmId;
    }
    if (OS.components.menu != null) {
      CM.menu.initialise();
    }
    if (OS.components.emailSignUp != null) {
      OS.emailSignUp.initialise();
    }
    if (OS.components.scrollPrompt != null) {
      CM.lib.scrollPrompt.initialise();
    }
    if (OS.components.video != null) {
      CM.video.init();
    }
    id = document.getElementsByTagName('body')[0].id;
    switch (id) {
      case 'p-account-recovery-forgot-login':
      case 'p-account-recovery-pre-confirmation':
      case 'p-account-recovery-reset-password':
      case 'p-account-recovery-tracking-result':
      case 'p-account-recovery-reset-email-sent':
      case 'p-account-recovery-enter-login':
      case 'p-account-recovery-form-submitted':
        return CM.accountRecovery.initialise();
      case 'p-account-recovery-appeal-form':
        CM.accountRecovery.getRecoverFromGame();
        CM.accountRecovery.initialise();
        return CM.accountRecovery.manualInit();
      case 'p-account-recovery-identified':
        return CM.accountRecovery.accountIdentified();
      case 'p-account-recovery-recover-from-game':
        CM.accountRecovery.initialise();
        return CM.accountRecovery.setRecoverFromGame();
      case 'p-create-account':
        return CM.accountCreation.initialise();
      case 'p-download':
        return CM.download.initialise('oldschool');
      case 'p-email-register-set-address':
      case 'p-email-register-change':
      case 'p-email-register-confirm-validated-email-address':
      case 'p-email-register-remove-login-email':
        return CM.emailRegister.initialise();
      case 'p-login':
        return CM.login.initialise();
      case 'p-logout':
        return CM.logout.initialise();
      case 'p-mfa':
        return CM.global.listenForm();
      case 'p-dob-submit':
        return CM.dob.initialise();
      case 'p-dob-submitted':
        CM.dob.initialise();
        return CM.dob.dobSubmitted();
      case 'p-email-register-set-address':
      case 'p-email-register-change':
        return CM.emailRegister.initialise();
      case 'p-launcher':
        return CM.launcher.initialise('oldschool');
      case 'p-password-history-password-change':
        return CM.global.listenForm();
      case 'p-sn-upgrade':
        return CM.setsnalogin.initialise();
      case 'p-ticketing-view-dialogue':
        return CM.ticketing.dialogue();
      case 'p-ticketing-inbox':
        return CM.ticketing.inbox();
      case 'p-welcome-back-game-os':
        return CM.welcomeBack.initialise('oldschool');
    }
  },
  foundation: function() {
    Foundation.Tabs.defaults.linkClass = 'c-tabs__option';
    Foundation.Tabs.defaults.panelClass = 'c-tabs__panel';
    Foundation.Tabs.defaults.deepLink = true;
    Foundation.Tabs.defaults.updateHistory = true;
    return $(document).foundation();
  }
};

OS.emailSignUp = {
  initialise: function() {
    return $(document).ready(function() {
      $('*[data-email-signup]').on('forminvalid.zf.abide', function() {
        return $(this).addClass('c-email-signup__form--style-attention');
      });
      return $('*[data-email-signup]').on('formvalid.zf.abide', function() {
        var date;
        date = new Date;
        date.setFullYear(date.getFullYear() + 10);
        return CM.lib.cookies.set('necessary', $(this).data("email-signup"), 1, date.toUTCString());
      });
    });
  }
};

OS.global.initialise();
