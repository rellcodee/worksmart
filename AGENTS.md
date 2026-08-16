[{
	"resource": "/home/reldww/codeIn/app/work-smart/app/_layout.tsx",
	"owner": "typescript",
	"code": "2724",
	"severity": 8,
	"message": "'\"../src/services/notificationService\"' has no exported member named 'scheduleDailyResetNotification'. Did you mean 'scheduleEventNotification'?",
	"source": "ts",
	"startLineNumber": 14,
	"startColumn": 10,
	"endLineNumber": 14,
	"endColumn": 40,
	"relatedInformation": [
		{
			"startLineNumber": 44,
			"startColumn": 23,
			"endLineNumber": 44,
			"endColumn": 48,
			"message": "'scheduleEventNotification' is declared here.",
			"resource": "/home/reldww/codeIn/app/work-smart/src/services/notificationService.ts"
		}
	],
	"origin": "extHost1"
}]

and
[{
	"resource": "/home/reldww/codeIn/app/work-smart/src/store/useTaskStore.ts",
	"owner": "typescript",
	"code": "2614",
	"severity": 8,
	"message": "Module '\"../services/notificationService\"' has no exported member 'triggerImmediateDailyResetNotification'. Did you mean to use 'import triggerImmediateDailyResetNotification from \"../services/notificationService\"' instead?",
	"source": "ts",
	"startLineNumber": 6,
	"startColumn": 3,
	"endLineNumber": 6,
	"endColumn": 41,
	"origin": "extHost1"
}]

have error in here