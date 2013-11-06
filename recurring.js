var clone = function (obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
};

var format = function (date) {
    return date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();
};

var daysInMonth = function (y, m) {
    var tmp = new Date();
    tmp.setFullYear(y);
    tmp.setMonth(m);
    tmp.setDate(32);
    return 32 - tmp.getDate();
};

var findDate = function (desiredDay, desiredOffset, Year, Month) {
    if (desiredDay === "" || desiredOffset === "" || Year === "" || Month === "") {
        return false;
    }
    if (desiredDay == null || desiredOffset == null || Year == null || Month == null) {
        return false;
    }
    var dateTest = new Date();
    dateTest.setFullYear(Year);
    dateTest.setMonth(Month);
    var hit = false;
    var offset = 0;
    var lastMatch = false;
    var monthLimit = daysInMonth(Year, Month);
    for (var i=1; i < monthLimit; i++) {
        dateTest.setDate(i);
        if (dateTest.getDay() == desiredDay) {
            lastMatch = new Date();
            lastMatch.setFullYear(Year);
            lastMatch.setMonth(Month);
            lastMatch.setDate(i);
            if (offset == desiredOffset) {
                return dateTest;
            }
            offset++;
        }
    }
    if (desiredOffset == 4) {
        return lastMatch;
    }
    return false;
};

var eventDates = function (event) {
	const weekLookup = { First: 0, Second: 1, Third: 2, Fourth: 3, Last: 4 };
	const dayLookup = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6};
	
	if (event['recurring_event'] != 't') {
	    console.log(event);
	    return;
	}

    var dateTest = event['date'];
    var dateCandidate = null;
    var rule = [];
    var ruleCount = 0;
    var exceptionCount = 0;
    var plusCount = 0;
    var except = [];
    var exceptDates = [];
    var exceptDate = false;    
    var include = [];
    var plus = false;
    var toSend = {};
    var dateCache = [];
    var dateCandidateKey = false;
	    
    if (Object.prototype.toString.call(event['plus_date']) === '[object Array]') {
        plusCount = event['plus_date'].length;
        for (j=0; j < plusCount; j++) {
            plus = event['plus_date'][j];
            toSend[plus['date'].toDateString()] = format(plus['date']);
        }
    }

    if (Object.prototype.toString.call(event['exception_date']) === '[object Array]') {
        exceptionCount = event['exception_date'].length;
        if (exceptionCount > 0) {
            for (j=0; j < exceptionCount; j++) {
                except = event['exception_date'][j];
                exceptDates.push(except['date'].toDateString());
            }
        }
    }

    var i = dateTest.getDate();
    var breakAt = false;
    var setMonth = dateTest.getMonth();
    var setYear = dateTest.getFullYear();
    while (dateTest.getTime() <= event['end_date'].getTime()) {
        if (!event.recurrence_rules || Object.prototype.toString.call(event['recurrence_rules']) != '[object Array]') {
            break;
        }
        breakAt = daysInMonth(dateTest.getFullYear(), dateTest.getMonth());
        if (i == breakAt) {
            if (setMonth == 11) {
                setMonth = 0;
                setYear++;
            } else {
                setMonth++;
            }
        }
        if (i > breakAt) {
            i = 1;
            dateTest.setMonth(setMonth);
            dateTest.setYear(setYear);
        }
        dateTest.setDate(i);
        i++;
        ruleCount = event['recurrence_rules'].length;
        for (j=0; j < ruleCount; j++) {
            rule = event['recurrence_rules'][j];
            if (rule['which'] == 'day') {
                if (dateTest.getDay() == dayLookup[rule['day_of_week']]) {
                    if (!rule['day_of_week_type']) {
                        toSend[dateTest.toDateString()] = format(dateTest);
                    } else {
                        dateCandidateKey = dateTest.getFullYear() + '-' + dateTest.getMonth();
                        if (dateCache[dateCandidateKey] === undefined) {
                            dateCache[dateCandidateKey] = 1;
                            dateCandidate = findDate (dayLookup[rule['day_of_week']], weekLookup[rule['day_of_week_type']], setYear, setMonth);
                            if (dateCandidate == false) {
                                continue;
                            }
                            toSend[dateCandidate.toDateString()] = format(dateCandidate);
                        }
                    }
                }
            } else {
                if (dateTest.getDate() == rule['month']) {
                    toSend[dateTest.toDateString()] = format(dateTest);
                }
            }
        }
    }

    if (exceptionCount > 0) {
        for (var key in exceptDates) {
            toSend[exceptDates[key]] = null;
        }
    }

    //loop over toSend
    var tmp = null;
    var newEvent = {};
    delete event['recurrence_rules'];
    delete event['end_date'];
    for (var sendKey in toSend) {
        if (toSend[sendKey] == null) {
            continue;
        }
        tmp = toSend[sendKey].split('/');
        newEvent = clone(event);
        newEvent['date'] = new Date(tmp[0], tmp[1], tmp[2], 5, 0, 0, 0);
        console.log(newEvent['code_name'] + ':' + newEvent['date']);
    }
};