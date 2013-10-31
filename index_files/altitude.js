window.addEvent('load', function() {
	/* Query the device pixel ratio */
	function getDevicePixelRatio() {
		return 1;
	}

	/* Process all document images */
	function processImages() {

	}

	processImages();
});

window.addEvent('domready', function() {
	if(window.location.hash.toLowerCase() == "#askaquestion") { $$('.askquestion').addClass('show'); }

	$(document.body)
		.addClass(Browser.name)
		.addClass(Browser.name + Browser.version)
		.addEvent('keydown', function(evt) {
			if(evt.code == 27) $$('.popup.show').removeClass('show');
		});

	$$('.popup .sleeve').addEvent('click', function(evt) { evt.stopPropagation(); });

	$$('.popup').addEvent('click', function() { this.removeClass('show'); });
	$$('.close').addEvent('click', function(evt) { if(evt) evt.stop(); this.getParent('.popup').removeClass('show'); });

	$$('.altpop').addEvent('click', function(evt) {
		if(evt) evt.stop();

		this.getNext().toggleClass('show');
	});

	$$('.shiny form').addEvent('submit', function(evt) {
		if(evt) evt.stop();

		$('email').addClass('loading');

		var AltitudeSubs = new Request({
			url: 'cmsubs.php',
			data: { 'first_name':$('first_name').get('value'), 'email':$('email').get('value') },
			onComplete: function(response) {
				$$('.shiny').addClass('message');

				new Element('p', { html:response }).addClass('the_message').inject($$('.shiny')[0], 'bottom');
				$('email').removeClass('loading');
			}
		}).send();
	});

	$$('.shiny').addEvent('click:relay(.ok)', function(evt) {
		if(evt) evt.stop();

		$$('.the_message').destroy();
		$$('.shiny').removeClass('message');

		if(this.hasClass('good')) {
			$('first_name').set('value', '');
			$('email').set('value', '');
		}
	});

	$$('.askquestion form').addEvent('submit', function(evt) {
		if(evt) evt.stop();

		if($('question_for').get('value') == 'Not selected' || $('your_question').get('value') == "") {
			alert("Please give us a message and let us know who it's for!");
		} else {
			var AltitudeQuestion = new Request({
				url: 'subquestion.php',
				data: { 'twitter':$('twitter_username').get('value'), 'question_for':$('question_for').get('value'), 'your_question':$('your_question').get('value') },
				onComplete: function() {
					$$('.askquestion h2').destroy();
					$$('.askquestion p').destroy();

					var newTitle = new Element('h2', { text:"Thanks for your question!" });
					var newText = new Element('p', { html:"We&rsquo;ll try our hardest to get as many of them answered as possible. <br />Feel free to ask another question!" });

					newText.inject($$('.askquestion .sleeve')[0], 'top');
					newTitle.inject($$('.askquestion .sleeve')[0], 'top');

					$$('.askquestion form')[0].reset();
					$$('#bespoke_question_for .selected span').set('text', 'Please select');
				}
			}).send();
		}
	});

	/* Custom Combo Boxes */
	if($$('.bespoke_combo')[0]) {
		var selectBoxOriginal = $$('select.hide');

		$$('.popup form').addEvent('click', function() {
			$$('.bespoke_combo.open').removeClass('open');
		});

		$$(selectBoxOriginal).each(function(comboBox, index) {
			var bespokeComboBox = $('bespoke_'+comboBox.get('id'));
			bespokeComboBox.getElement('ul li').destroy(); //Remove dummy li, need it for validation

			var bespokeLabel = $$('label[for='+comboBox.get('id')+']');
			bespokeLabel.addEvent('click', function(evt) {
				if(evt) evt.stop();

				bespokeComboBox.getElement('.selected').fireEvent('click');
			});

			// Check if something already set
			if(comboBox.get('value') != "Not selected") bespokeComboBox.getElement('.selected span').set('text', comboBox.getChildren('option[value='+comboBox.get('value')+']').get('text'));

			// Add some simple behaviour/classes
			bespokeComboBox.addEvents({
				'mouseenter': function() { this.addClass('in'); },
				'mouseleave': function() { this.removeClass('in'); }
			});

			bespokeComboBox.getElement('.selected').addEvents({
				'click': function(evt) {
					if(evt) evt.stop();

					this.focus();

					if(bespokeComboBox.hasClass('open')) {
						bespokeComboBox.toggleClass('open');
					} else {
						$$('.bespoke_combo').removeClass('open');
						bespokeComboBox.toggleClass('open');
					}
				},
				'keydown': function(evt) {
					if(evt.code == 9) bespokeComboBox.removeClass('open');
				}
			});

			// Keyboard Events
			$$('.bespoke_combo').addEvents({
				'keydown:relay(.selected:focus)': function(evt) {
					if(evt.code == 38 || evt.code == 40) {
						evt.stop();

						this.getParent('.bespoke_combo').addClass('open');
						this.getNext('ul').getChildren('li a')[0].focus();
					}
				},
				'keydown:relay(a:not(.selected))': function(evt) {
					if(evt.code == 38) { // Up
						evt.stop();
						if(this.getParent('li').getPrevious('li')) this.getParent('li').getPrevious('li').getChildren('a')[0].focus();
					}

					if(evt.code == 40) { // Down
						evt.stop();
						if(this.getParent('li').getNext('li')) this.getParent('li').getNext('li').getChildren('a')[0].focus();
					}
				}
			});

			// Create list item for each option
			$$(comboBox.getChildren('option')).each(function(option, index) {
				var anchor = new Element('a');

				anchor
					.setProperty('href','#')
					.setProperty('html',option.get('text'))
					.setProperty('tabindex',-1);

				var item = new Element('li');

				anchor.inject(item);
				item.inject(bespokeComboBox.getElement('ul'));
			});

			// Create click event for each item in the list
			bespokeComboBox.getElements('a:not(.selected)').each(function(elem, index) {
				elem.addEvent('click', function(evt) {
					evt.stop();

					bespokeComboBox.getElement('.selected').focus();

					$$('.bespoke_combo').removeClass('open');
					bespokeComboBox.getElement('.selected span').set('text', elem.get('text'));

					var realOptions = comboBox.getElements('option');
					realOptions.removeProperty('selected');
					realOptions[index].set('selected', 'selected');

					if(elem.get('text') == "Other") $$('.field.other').addClass('show');
						else $$('.field.other').removeClass('show');
				});
			});
		});
	}
});