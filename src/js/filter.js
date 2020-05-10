// ==UserScript==
// @name         Google Classroom Grades Filter
// @version      0.1.3
// @description  Allows you to filter columns in your Classroom Grades
// @author       Al Caughey
// @include      https://classroom.google.com/c/*
// @license      https://github.com/al-caughey/Google-Grades-Filter/blob/master/LICENSE.md
// @run-at       document-idle
// ==/UserScript==

//History:
// v0.1.1 - first post publish Chrome store; improvements to styleSheets
// v0.1.2 - Changed the display name
// v0.1.3 - Changed the waitfor element and also the manifest path

;(function() {
	// simple function that waits until a specific element exists in the DOM...
	// (adapted from Stack Overflow
	function waitForElement(elementPath, callBack){
		window.setTimeout(function(){
			let itExists=document.querySelector(elementPath)
			if(!itExists ||itExists.length===0){
				waitForElement(elementPath, callBack);
			}
			else{
				callBack(itExists);
			}
		},100)
	}
	
	//Add an element to the DOB
	function addElement(p, e, i, ti, cl){
		let de=document.createElement(e)
		de.id=i
		de.title=ti
		if(!!cl) de.classList.add(cl)
		if(e==='img') de.src = chrome.runtime.getURL("images/"+i+".png");
		p.appendChild(de)
	}
	
	//Hide all of the td/th tags that do not match the specified text
	function hideNonMatching(txt) {
		let found=[];
		let stext=txt.toLowerCase()
		document.querySelectorAll("thead th").forEach(function(el,n) {
			//currently matching on indexOf...
			//TODO - allow a regex for more powerful pattern matching
			// skip the first th
			if (n===0||el.textContent.toLowerCase().indexOf(stext) > -1 ) return
			found.push(n);
			el.classList.add('hidden')
		})
		
		//if there were not matches (i.e., all of the th entries were hidden... unhide and try highlight the input field)
		if(found.length===document.querySelectorAll("thead th").length-1){
			revealAllHidden()
			document.getElementById('grades-filter').classList.add('no-matches')
			return
		}
		
		// otherwise hide the td elements in the table
		document.querySelectorAll("tbody tr").forEach(function(row) {
			let gridcells=row.querySelectorAll("td")
			found.forEach(function(n) {
				//n-1 because skipping th cell in row
				if(!gridcells[n-1]) return
				gridcells[n-1].classList.add('hidden')
			})
		})
	}
	
	// remove the hidden class from all hidden entries
	function revealAllHidden() {
		document.querySelectorAll('.hidden').forEach(function(el) {
			el.classList.remove('hidden')
		})
	}
	
	// after the user enters text...
	function filterColumns() {
		let filterText=document.getElementById('grades-filter').value
		revealAllHidden()
		document.getElementById('grades-filter').classList.remove('no-matches')
		if(filterText==='') return
		hideNonMatching(filterText)
	}
	
	//debounce the key inputs so it waits for the user to stop typing
	function debounce(fn, duration) {
		let timer;
		return function() {
			clearTimeout(timer);
			timer = setTimeout(fn, duration)
		}
	}
	
	// add the input field
	function initFilters(lb){
		let gfd=document.createElement('div')
		gfd.id='grades-filter-div'
		gfd.classList.add('wZTANe')
		addElement(gfd,'img','icon48','Enter the search string')
		addElement(gfd,'input','grades-filter','Enter the search string')
		document.querySelectorAll('[soy-server-key]')[1].prepend(gfd)
		document.getElementById('grades-filter').placeholder='Filter for...'	
		document.getElementById('grades-filter').style.backgroundImage=chrome.runtime.getURL("images/icon48.png")
		document.getElementById('grades-filter').addEventListener('keyup', debounce(() => {
			filterColumns()
		}, 250))
		
		var observer = new MutationObserver(styleChangedCallback);
		observer.observe(document.querySelector('[guidedhelpid="gradebookTab"]'), {
			attributes: true,
			attributeFilter: ['classList'],
		});
		function styleChangedCallback(mutations){
			console.log('mutations:',mutations);
		}
	}
	
	// wait until we're on the Grades tab to add the filter field
	// TODO - hide the field if when the user leaves the Grades tab
	//waitForElement('[aria-label="Grades (selected)"]',initFilters);
	waitForElement('[guidedhelpid="gradebookTab"]',initFilters);
	
	
})()