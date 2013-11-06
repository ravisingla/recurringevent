recurringevent
==============

The recurring.js function takes in an event in a certain format.

Depending on the rule specified, it should output to console multiple dates for one date submitted.

For example, in the follwing example:

eventDates({
	"code_name" : "north_fulton_neighborhood_networking_breakfast",
	"date" : new Date("2013-10-15T04:00:00Z"),
	"end_date" : new Date("2014-04-30T04:00:00Z"),
	"recurrence_rules" : [
		{
			"which" : "day",
			"day_of_week" : "Tuesday",
			"day_of_week_type" : "Third",
			"month" : ""
		}
	],
	"recurring_event" : "t"
});

The event should repeat on the Third Tuesday of each month until 2014-04-30.

We need to create a test suite for this function that proves that it generates dates for:

First, Second, Third, Fourth, Last day of a month reliably
