/**
 * Class to handle the job widget form
 * @param {Object} URI is an object of the class URI
 * @constructor
 */
var JobModuleForm = function(URI) {
  this.URI = URI;
  this.recruiter = '';
  this.branches = [];
  this.checkBoxes = [
    'hidedescription',
    'hideplacetime',
    'searchform'
  ];
  this.radioButtons = [
    'buttontextcolor',
    'pagebuttontextcolor'
  ];
  this.defaultValues = {
    language: 'nl-NL',
    titlecolor: '428BCA',
    textcolor: '333333',
    footercolor: '3A9615',
    fontsize: '14',
    'results-per-page': '15',
    fonttype: 'Helvetica',
    hidedescription: 'true',
    hideplacetime: 'true',
    searchform: 'false',
    buttoncolor: '5CB85C',
    buttontextcolor: 'FFFFFF',
    bgcolor: 'FFFFFF',
    hovercolor: 'F4F4FF',
    pagebuttoncolor: '428BCA',
    pagebuttontextcolor: 'FFFFFF',
    loadingcolor: '11BAF2',
    loadingcolorbackground: 'B5E9F7'
  };
  this.advancedValues = {
    bgcolor: 'FFFFFF',
    hovercolor: 'F4F4FF',
    pagebuttoncolor: '428BCA',
    pagebuttontextcolor: 'FFFFFF',
    loadingcolor: '11BAF2',
    loadingcolorbackground: 'B5E9F7'
  };
  this.filter = {
    radioagency: false,
    education: [],
    branch: [],
    category: []
  };

  this.userfilter = {
    radiouser: false,
    education: false,
    branch: false,
    category: false
  };

  this.location = document.location.pathname;
  this.design = {};
  this.formSubmitted = false;
};

/**
 * Preparing the forms.
 */
JobModuleForm.prototype.prepare = function() {
  this.loadFromUrl();
  if(this.location === '/vacaturemodule/vacaturemodule-stap-een.html') {
    this.prepareStepOne();
  } else if(this.location === '/vacaturemodule/vacaturemodule-stap-twee.html') {
    this.prepareStepTwo();
  } else if(this.location === '/vacaturemodule/vacaturemodule-stap-drie.html') {
    this.prepareStepThree();
  }
};

/**
 * Function for preparing step one of the job-module.
 */
JobModuleForm.prototype.prepareStepOne = function() {
  this.prepareRecruiters();
  this.fillTheFormStepOne();
};

/**
 * Function for preparing step two of the job-module.
 */
JobModuleForm.prototype.prepareStepTwo = function() {
  this.prepareBranches();
  var self = this;
  // Attach event to all the informationform checkboxes for when they get clicked.
  for(var i = 0; i < this.checkBoxes.length; i++) {
    this.attachEventToElement('informationform-' + this.checkBoxes[i], function() {
      self.submitCheckBoxes();
    }, 'click');
  }
  // Attach event when the button "Opmaak kiezen" gets clicked.
  this.attachEventToElement('chooseDesign', function(e) {
    self.showDesignChoices(e);
  }, 'click');
  // Attach event when the link "Terug naar standaardinstellingen" gets clicked.
  this.attachEventToElement('default', function(e) {
    self.setToDefault(e);
  }, 'click');
  this.makeFilter();
  this.checkFilterRadioButtons();
  // Attach event when the link "Geavanceerde instellingen" gets clicked.
  this.attachEventToElement('advancedOptionsLink', this.advancedOptions, 'click');
  // Attach event when the button "Ga naar volgende stap" gets clicked.
  this.attachEventToElement('buttonDone', this.goToStepThree, 'click');
  this.fillTheFormStepTwo();
  this.showAdvancedForm();
  this.showTheExample();
};

/**
 * Function for preparing step three of the job-module.
 */
JobModuleForm.prototype.prepareStepThree = function() {
  this.showTheCode();
};

/**
 * Function for adding an event to an element.
 * @param {String} id Id of the element.
 * @param {String} method Method that should be called when the event occurs.
 * @param {String} event A string representing the event type to listen for.
 */
JobModuleForm.prototype.attachEventToElement = function(id, method, event) {
  var element = document.getElementById(id);
  if(element) {
    if(element.addEventListener) {
      element.addEventListener(event, method, false);
    } else if(element.attachEvent) {
      element.attachEvent('on' + event, method);
    }
  }
};

/**
 * Function for showing the advanced tab. This tab will be shown when an advanced value has been changed.
 */
JobModuleForm.prototype.showAdvancedForm = function() {
  for(var value in this.advancedValues) {
    if(this.advancedValues[value] !== this.design[value]) {
      this.advancedOptions();
      break;
    }
  }
};

/**
 * Method to load the values from the url parameters.
 */
JobModuleForm.prototype.loadFromUrl = function() {
  var params = this.URI.parseQuery(location.search);
  this.recruiter = params.r || '';
  if(this.location === '/vacaturemodule/vacaturemodule-stap-twee.html' || this.location === '/vacaturemodule/vacaturemodule-stap-drie.html') {
    this.language = params.language;
    // When recruiter is empty the page will redirect to vacaturemodule-stap-een.html.
    if(this.recruiter === '') {
      this.changeLocation('vacaturemodule-stap-een.html');
    }
    for(var value in this.defaultValues) {
      // When all the parameters are in the url we assume that the form has been submitted.
      if(params[value] && this.checkBoxes.indexOf(value) < 0 && this.location === '/vacaturemodule/vacaturemodule-stap-twee.html') {
        this.formSubmitted = true;
      }
      // Filling design with parameter out of url. When parameter is empty design will be filled with defaultvalue.
      this.design[value] = params[value] || this.defaultValues[value];
    }
    // When checkboxes are not checked they will not be send on form.submit(). So when they are not in the url we assume that they are false.
    this.design.hidedescription = params.description || 'false';
    this.design.hideplacetime = params.placetime || 'false';
    this.design.searchform = params.searchform || 'false';
    this.filter.radioagency = params.optradio || false;
    this.userfilter.radiouser = params.useroptradio || false;
  }

  if(params.filter){
    this.loadFilterFromUrl(params.filter);
  }
  if(params.userfilter){
    this.loadUserFilterFromUrl(params.userfilter);
  }
};

/**
 * Loads the filters from the url with for loop and adds them to the select box
 * @param {Array} filters Array of the selected filters
 */
JobModuleForm.prototype.loadFilterFromUrl = function(filters) {
  var self = this;
  if(typeof filters === 'string') {
    filters = filters.split();
  }
  for(var i = 0; i < filters.length; i++) {
    if(filters[i].indexOf('education') === 0) {
      self.filter.education.push(filters[i].replace('education-', ''));
    } else if(filters[i].indexOf('category') === 0) {
      self.filter.category.push(filters[i].replace('category-', ''));
    } else {
      self.filter.branch.push(filters[i]);
    }
  }
};

/**
 * Loads the userfilters from the url with for loop and adds them to the select box
 * @param {Array} filters Array of the selected filters
 */
JobModuleForm.prototype.loadUserFilterFromUrl = function(filters) {
  var self = this;
  if(typeof filters === 'string') {
    filters = filters.split();
  }
  for(var i = 0; i < filters.length; i++) {
    if(filters[i] === 'Opleidingsniveau') {
      self.userfilter.education = true;
    } else if(filters[i] === 'Categorie') {
      self.userfilter.category = true;
    } else if(filters[i] === 'Vestiging') {
      self.userfilter.branch = true;
    }
  }
};

/**
 * Prepare the recruiter part of the form. Loads a list of recruiters to show them.
 */
JobModuleForm.prototype.prepareRecruiters = function() {
  var self = this;
  Recruiter.getAll(function(recruiters) {
    self.showRecruiterList(recruiters);
  });
};

/**
 * Prepare the branches part of the form. Loads a list of branches from the given recruiter to show.
 */
JobModuleForm.prototype.prepareBranches = function() {
  var self = this;
  Branches.getAll(this.recruiter, function(branches) {
    self.branches = branches;
    self.fillFilter(branches);
  })
};

/**
 * Method to fill the form with the data in this instance.
 */
JobModuleForm.prototype.fillTheFormStepOne = function() {
  var r = document.getElementById('r');
  if(r && this.recruiter !== '') {
    r.value = this.recruiter;
  }
};

/**
 * Show the list of recruiters that users can choose for the form.
 * @param {Array} recruiters List of objects describing recruiters in the form of {name:'',id:1}.
 */
JobModuleForm.prototype.showRecruiterList = function(recruiters) {
  // Create the select box to show the recruiters in.
  var select = document.createElement('select');
  select.name = 'r';
  select.id = 'r';
  select.required = true;
  select.className = 'form-control';
  // Now create options for all recruiters.
  for(var i = 0; i < recruiters.length; i++) {
    var option = document.createElement('option');
    option.value = recruiters[i].id;
    option.appendChild(document.createTextNode(recruiters[i].name));

    // Make sure the selected recruiter will be shown as selected in the form.
    if(this.recruiter && recruiters[i].id === this.recruiter) {
      option.selected = true;
    }

    // Add the option to the select box.
    select.appendChild(option);
  }

  // Find the destination for our new select box. Replace the destination with this select box.
  var destination = document.getElementById('recruiter-list-loader');
  destination.parentNode.replaceChild(select, destination);
};

/**
 * Fill the form of step two.
 */
JobModuleForm.prototype.fillTheFormStepTwo = function() {
  // Setting the fields of the information form.
  document.getElementById('informationform-recruiterId').value = this.recruiter;
  for(var i = 0; i < this.checkBoxes.length; i++) {
    document.getElementById('informationform-' + this.checkBoxes[i]).checked = JSON.parse(this.design[this.checkBoxes[i]]);
  }

  // Setting the fields of the design form.
  document.getElementById('recruiterId').value = this.recruiter;
  for(var element in this.design) {
    if(this.checkBoxes.indexOf(element) >= 0) {
      document.getElementById(element).checked = JSON.parse(this.design[element]);
    } else if(this.radioButtons.indexOf(element) >= 0) {
      var color = this.design[element] === '000000' ? 'black' : 'white';
      document.getElementById(element + color).checked = true;
    } else {
      document.getElementById(element).value = this.design[element];
    }
  }
  var myOpts = document.getElementById('agencyfilter').options;
  for(var j = 0; j < myOpts.length; j++) {
    for(var k = 0; k < this.filter.education.length; k++) {
      if(myOpts[j].value.replace('education-', '') === decodeURI(this.filter.education[k])) {
        $('#agencyfilter option').eq(j).prop('selected', true);
      }
    }
    for(var l = 0; l < this.filter.category.length; l++) {
      if(myOpts[j].value.replace('category-', '') === this.filter.category[l]) {
        $('#agencyfilter option').eq(j).prop('selected', true);
      }
    }
  }
  $('#agencyfilter')[0].sumo.reload();
  if(this.userfilter.category){
    $('#userfilter option').eq(0).prop('selected', true);
  }
  if(this.userfilter.education){
    $('#userfilter option').eq(1).prop('selected', true);
  }
  if(this.userfilter.branch) {
    $('#userfilter option').eq(2).prop('selected', true);
  }
  $('#userfilter')[0].sumo.reload();

  // When designform has been submitted once we keep showing the design form.
  if(this.formSubmitted) {
    this.showDesignChoices();
  }
};

/**
 * Method that shows the code that is required to use the job widget.
 */
JobModuleForm.prototype.showTheCode = function() {
  var code = this._getTheCode();
  document.getElementById('code-body').value = code;
};

/**
 * Method that shows the example, where the job widget is demonstrated.
 */
JobModuleForm.prototype.showTheExample = function() {
  var code = this._getTheCode();

  // Parse the code.
  var div = code.substring(code.indexOf('<div'), code.indexOf('</div>') + 6);
  var scriptSrc = code.substring(code.indexOf('<script>') + 8, code.indexOf('</script>'));

  // Attach the target div.
  document.getElementById('example-body').innerHTML = div;

  // Execute the required javascript.
  var scriptTag = document.createElement('script');
  scriptTag.text = scriptSrc;
  document.body.appendChild(scriptTag);
};

/**
 *  Method to build the script url from the form data.
 * @returns {String} The url of the job widget script.
 */
JobModuleForm.prototype._getTheCode = function() {
  var code =  '<div class="helios-jobframe" data-source="uzbnl" data-recruiter=' + this.recruiter + ' ' +
    this.getDesignChoices() + this.getFilterChoice() + this.getUserFilterChoice() + '>' +
    '</div>' + '\n' +
    '\n' +
    '<script>' + '\n' +
    '  (function(d, s, id) {' + '\n' +
    '    var js, fjs = d.getElementsByTagName(s)[0];' + '\n' +
    '    if (d.getElementById(id)) return;' + '\n' +
    '    js = d.createElement(s); js.id = id;' + '\n' +
    '    js.src = "//helios.uitzendbureau.nl/public/build/js/ext.min.js";' + '\n' +
    '    fjs.parentNode.insertBefore(js, fjs);' + '\n' +
    '  }(document, \'script\', \'helios-joboverview\'));' + '\n' +
    '</script>';
  return code;
};

/**
 * Function for creating a string with all the filter choices.
 * @returns {String} with the user filter choices.
 */
JobModuleForm.prototype.getFilterChoice = function() {
  var filter = '';
  if(this.filter.branch[0]) {
    filter = 'data-filter-branch' + '="' + this.filter.branch + '" ';
  }
  if(this.filter.education[0]) {
    filter += 'data-filter-education' + '="' + this.filter.education + '" ';
  }
  if(this.filter.category[0]) {
    filter += 'data-filter-category' + '="' + this.filter.category + '" ';
  }
  return filter;
};

/**
 * Function for creating a string with all the user filter choices.
 * @returns {String} with the user filter choices.
 */
JobModuleForm.prototype.getUserFilterChoice = function() {
  var userfilters = 'data-filter-user-education' + '="' + this.userfilter.education + '" ';
  userfilters += ' data-filter-user-category' + '="' + this.userfilter.category + '" ';
  userfilters += ' data-filter-user-branch' + '="' + this.userfilter.branch + '" ';
  if(this.userfilter.education || this.userfilter.category || this.userfilter.branch){
    userfilters += ' data-filter' + '="' + true + '" ';
  }
  return userfilters;
};

/**
 * Function for creating a string with all the design choices.
 * @returns {String} with the design choices.
 */
JobModuleForm.prototype.getDesignChoices = function() {
  var design = '';
  var tempDesign;
  for(var elementId in this.design) {
    tempDesign = this.design[elementId];
    if(elementId === 'hideplacetime' || elementId === 'hidedescription') {
      tempDesign = !JSON.parse(this.design[elementId]);
    }
    if(elementId.indexOf('color') > -1 && this.design[elementId].indexOf('#') === -1) {
      tempDesign = '#' + this.design[elementId];
    }
    design += 'data-' + elementId + '="' + tempDesign + '" ';
  }
  return design;
};

/**
 * Function for showing/hiding the advanced options.
 */
JobModuleForm.prototype.advancedOptions = function() {
  var container = document.getElementById('advancedOptions');
  var link = document.getElementById('advancedOptionsLink');
  if(container.className.indexOf('hidden') === -1) {
    container.className += container.className ? ' hidden' : 'hidden';
    link.innerHTML = '+ Geavanceerde instellingen';
  } else {
    link.innerHTML = '- Geavanceerde instellingen';
    container.className = container.className.replace('hidden', '');
  }
};

/**
 * Function for filling the fields with their default value. Function gets called when "Terug naar standaardinstellingen" is clicked.
 * @param {Object} e is a MouseEvent.
 */
JobModuleForm.prototype.setToDefault = function(e) {
  // prevent default href because submit will refresh the page.
  if(e) {
    e.preventDefault();
  }
  if(!this.isDesignChoiceDefault()) {
    for(var elementId in this.defaultValues) {
      // Set the checkboxes to their default.
      if(this.checkBoxes.indexOf(elementId) > -1) {
        document.getElementById(elementId).checked = JSON.parse(this.defaultValues[elementId]);
        continue;
      }
      // Pagebuttontextcolor and buttontextcolor set to white.
      if(this.radioButtons.indexOf(elementId) > -1) {
        document.getElementById(elementId + 'white').checked = true;
        continue;
      }
      if(document.getElementById(elementId).color) {
        document.getElementById(elementId).color.fromString(this.defaultValues[elementId]);
      } else {
        document.getElementById(elementId).value = this.defaultValues[elementId];
      }
    }
    var designform = document.getElementsByName('designform')[0];
    designform.action = '#designform';
    designform.submit();
  }
  $('#agencyfilter option').prop('selected', false);
  $('#agencyfilter')[0].sumo.reload();
  $('#radiono').prop('checked', true);
  $('#userfilter option').prop('selected', false);
  $('#userfilter')[0].sumo.reload();
  $('#userradiono').prop('checked', true);
  this.disableEnableFields(false);
};

/**
 * Function for checking if the design is already default.
 * @returns {Boolean} upToDate Is true when design is default.
 */
JobModuleForm.prototype.isDesignChoiceDefault = function() {
  var upToDate = true;
  for(var elementId in this.defaultValues) {
    if(this.checkBoxes.indexOf(elementId) > -1) {
      if(JSON.parse(this.defaultValues[elementId]) !== document.getElementById(elementId).checked) {
        upToDate = false;
      }
    } else if(this.radioButtons.indexOf(elementId) > -1) {
      var color = document.getElementById(elementId + 'white').checked ? 'FFFFFF' : '000000';
      if(this.defaultValues[elementId] !== color) {
        upToDate = false;
      }
    } else {
      if(this.defaultValues[elementId] !== document.getElementById(elementId).value) {
        upToDate = false;
      }
    }
  }
  return upToDate;
};

/**
 * Function for showing the design form.
 * @param {object} e is a MouseEvent.
 */
JobModuleForm.prototype.showDesignChoices = function(e) {
  // e is filled when "opmaak kiezen" is clicked.
  if(e) {
    e.target.blur();
  }
  var designform = document.getElementsByName('designform')[0];
  designform.className = designform.className.replace('hidden', '');
  if(!this.isDesignChoiceDefault() || e) {
    this.disableEnableFields(true);
  }
};

/**
 * Function for changing the page location to step 3.
 */
JobModuleForm.prototype.goToStepThree = function() {
  var designform = document.getElementsByName('designform')[0];
  designform.action = 'vacaturemodule-stap-drie.html';
};

/**
 * Function for disabling/enabling the checkboxes and defaultDesignButton.
 * @param {Boolean} disable if true the fields will be disabled. if false the fields will be enabled.
 */
JobModuleForm.prototype.disableEnableFields = function(disable) {
  var defaultDesignButton = document.getElementById('default-design-button');
  defaultDesignButton.disabled = disable;
  for(var i = 0; i < this.checkBoxes.length; i++) {
    document.getElementById('informationform-' + this.checkBoxes[i]).disabled = disable;
  }
};

/**
 * Function for updating the url after an checkbox has been pressed.
 * @param {Boolean} disable if true the fields will be disabled. if false the fields will be enabled.
 */
JobModuleForm.prototype.submitCheckBoxes = function() {
  var defaultDesignButton = document.getElementById('default-design-button');
  if(!defaultDesignButton.disabled) {
    var search = {};
    search.r = this.recruiter;
    for(var i = 0; i < this.checkBoxes.length; i++) {
      if(this.checkBoxes[i].indexOf('hide') === 0) {
        search[this.checkBoxes[i].substring(4)] = document.getElementById('informationform-' + this.checkBoxes[i]).checked;
      } else {
        search[this.checkBoxes[i]] = document.getElementById('informationform-' + this.checkBoxes[i]).checked;
      }
    }
  }
  this.changeLocation('vacaturemodule-stap-twee.html?' + this.URI.buildQuery(search));
};

JobModuleForm.prototype.changeLocation = function(url) {
  document.location = url;
};

/**
 * Function for making the filter disabled and enabled and add events
 */
JobModuleForm.prototype.makeFilter = function() {
  $('#agencyfilter').change(function(e) {
    e.stopPropagation();
  });
  $('#agencyfilter').SumoSelect({placeholder: 'Selecteer filters'});

  var UPDATE_FILTER = function() {
    if($('#radiono').is(':checked')) {
      $('#radioyes').prop('checked', true);
    }
  };

  var disablefilterSelection = function() {
    $('#agencyfilter option').prop('selected', false);
    $('#agencyfilter')[0].sumo.reload();
    $('#radiono').prop('checked', true);
  }

  $('#agencyfilter').click(UPDATE_FILTER);
  $('#radiono').click(disablefilterSelection);

  $('#userfilter').SumoSelect({placeholder: 'Selecteer filters'});
  var UPDATE_USER_FILTERS = function() {
    if($('#userradiono').is(':checked')) {
      $('#userradioyes').prop('checked', true);
    }
  };

  var disableuserfilterSelection = function() {
    $('#userfilter option').prop('selected', false);
    $('#userfilter')[0].sumo.reload();
    $('#userradiono').prop('checked', true);
  };

  $('#userfilter').click(UPDATE_USER_FILTERS);
  $('#userradiono').click(disableuserfilterSelection);

  if(this.userfilter.radiouser === 'true') {
    $('#userradioyes').prop('checked', true);
  } else {
    $('#userfilter option').prop('selected', false);
    $('#userfilter')[0].sumo.reload();
    $('#userradiono').prop('checked', true);
  }
};

/**
 * Function for filling the filter dropdown menu with branches
 */
JobModuleForm.prototype.fillFilter = function(branches) {
  var self = this;
  for(var i = 0; i < branches.length; i++) {
    $('#agencyfilter')[0].sumo.add(branches[i].id, branches[i].name, 0);
    for(var j = 0; j < self.filter.branch.length; j++) {
      if(branches[i].id === self.filter.branch[j]) {
        $('#agencyfilter option').eq(0).prop('selected', true);
        $('#agencyfilter')[0].sumo.reload();
      }
    }
  }
  $('#agencyfilter')[0].sumo.remove(branches.length);
  $('#agencyfilter')[0].sumo.reload();
};

/**
 * Function for checking the radiobutton state and filling it
 */
JobModuleForm.prototype.checkFilterRadioButtons = function() {
  if(this.filter.radioagency === 'true') {
    $('#radioyes').prop('checked', true);
  } else {
    $('#agencyfilter option').prop('selected', false);
    $('#agencyfilter')[0].sumo.reload();
    $('#radiono').prop('checked', true);
  }
}
