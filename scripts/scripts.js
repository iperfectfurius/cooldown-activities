const categoriesContainer = document.getElementById('categoriesContainer');

const ProgressBars = [];
const types = {
	months: {
		id: 1,
		color: '#1F4E79',
		percent: 12
	},
	days: {
		id: 2,
		color: '#2E8B57',
		percent: 30
	},
	hours: {
		id: 3,
		color: '#F28C28',
		percent: 24
	},
	minutes: {
		id: 4,
		color: '#8E44AD',
		percent: 60
	},
	seconds: {
		id: 5,
		color: '#D32F2F',
		percent: 60
	}

}
window.onload = async function () {
	loadIndex();
	document.getElementById('createActivitySubmit').addEventListener('click', () => createActivity());
	document.getElementById('createActivityContainer').addEventListener('click', () => {
		document.getElementById('createActivityContainer').classList.add('off');
	});
	document.getElementById('createActivityForm').addEventListener('click', e => {
		e.stopPropagation();
	});
};

async function loadIndex() {

	const rq = await fetch("api/categories/getAllCategoriesAndActivities.php", {
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		method: "POST",
		body: JSON.stringify(getUserAuthentication())
	});

	loadCategoriesAndActivities(await rq.json());
}

function getUserAuthentication() {
	return {
		internalId: localStorage.getItem('internalId'),
		externalId: localStorage.getItem('externalId')
	}
}

function loadCategoriesAndActivities(data) {

	Object.keys(data).forEach(key => {
		createCategory(data[key], key);
	});
	addProgressBars();
}

function createCategory(category, name) {
	const categoryContainer = document.createElement('div');
	categoryContainer.classList.add('category', 'border-shadown-style');

	const categoryTitle = document.createElement('div');
	categoryTitle.classList.add('title');
	categoryTitle.textContent = name;

	const resume = document.createElement('div');
	resume.classList.add('resume');

	categoryContainer.append(categoryTitle, resume, loadActivities(category.activities, category.id));


	categoriesContainer.append(categoryContainer);

}

function loadActivities(activities, categoryId) {
	const activitiesParent = document.createElement('div');
	activitiesParent.classList.add('activities');

	const activityTitle = document.createElement('div');
	activityTitle.classList.add('activities-title');

	const title = document.createElement('span');
	title.textContent = 'Activities';

	const createActivityIcon = document.createElement('i');
	createActivityIcon.classList.add('fa-solid', 'fa-plus', 'fa-xs');
	createActivityIcon.addEventListener('click', () => openCreateActivityForm(categoryId))

	activityTitle.append(title, createActivityIcon);

	activitiesParent.append(activityTitle);

	activitiesParent.append(createActivityHeader())

	const activitiesContainer = document.createElement('div');
	activitiesContainer.classList.add('activities-container');

	activities.forEach(activity => {
		const activityContainer = document.createElement('div');
		activityContainer.classList.add('activity');

		const activityName = document.createElement('div');
		activityName.classList.add('activity-name');

		activityName.textContent = activity.activityName;

		const timer = document.createElement('div');
		timer.classList.add('timer');
		timer.id = `activity_${activity.id}`

		const { DateTime } = luxon;

		const pasado = DateTime.fromSQL(activity.lastUpdate);
		const ahora = DateTime.local();
		const diff = ahora.diff(pasado, ['months', 'days', 'hours', 'minutes', 'seconds']).toObject();


		Object.keys(types).forEach((e) => {
			ProgressBars.push({ type: e, value: diff, id: `activity_${activity.id}`, color: types[e].color });
		});

		const actions = document.createElement('div');
		actions.classList.add('actions');

		const updateActivityIcon = document.createElement('i');
		updateActivityIcon.classList.add('fa-solid', 'fa-rotate-right', 'fa-xs');
		updateActivityIcon.addEventListener('click', () => updateTimeActivity(activity.id));

		actions.append(updateActivityIcon);

		activityContainer.append(activityName, timer, actions);

		activitiesContainer.append(activityContainer);
	});

	activitiesParent.append(activitiesContainer);

	return activitiesParent;
}

function createActivityHeader() {
	const activityHeader = document.createElement('div');
	activityHeader.classList.add('activity-header', 'activity');

	const activityHeaderName = document.createElement('div');
	activityHeaderName.classList.add('activity-name');

	const activityHeaderSpanName = document.createElement('span');
	activityHeaderSpanName.textContent = 'Activity name';
	activityHeaderSpanName.classList.add('activity-header-name');

	activityHeaderName.append(activityHeaderSpanName);

	const headerTimer = document.createElement('div');
	headerTimer.classList.add('timer', 'activity-timers');

	const headerMonths = document.createElement('span');
	headerMonths.textContent = 'M';
	headerMonths.title = 'Months'
	const headerDays = document.createElement('span');
	headerDays.textContent = 'D';
	headerDays.title = 'Days'
	const headerHours = document.createElement('span');
	headerHours.textContent = 'H';
	headerHours.title = 'Hours'
	const headerMinutes = document.createElement('span');
	headerMinutes.textContent = 'm';
	headerMinutes.title = 'Minutes'
	const headerSeconds = document.createElement('span');
	headerSeconds.textContent = 'S';
	headerSeconds.title = 'Seconds'

	headerTimer.append(headerMonths, headerDays, headerHours, headerMinutes, headerSeconds);

	const headerActions = document.createElement('div');
	headerActions.classList.add('activity-actions', 'actions');

	const actionHeaderContent = document.createElement('span');

	headerActions.append(actionHeaderContent);

	activityHeader.append(activityHeaderName, headerTimer, headerActions);

	return activityHeader;
}

function addProgressBars() {

	ProgressBars.forEach(e => {
		let value = e.value[e.type]?.toFixed(0) ?? 0;

		const container = document.createElement('div');

		const bar = new ProgressBar.Circle(container, {
			strokeWidth: 10,
			trailWidth: 10,
			color: e.color,
			trailColor: '#eee',
			duration: 950,
			easing: 'easeInOut',
			text: {
				value: value,
				className: 'progressbar-text'
			}
		});
		e.bar = bar;

		if (e.type == 'seconds')
			startIncrementing(e);

		document.getElementById(e.id).append(container);

		bar.animate(value / types[e.type].percent);
	})
}

function startIncrementing(bar, conditions) {
	let percent = +bar.bar.text?.textContent ?? 0;

	function tick() {
		percent += 1;
		if (percent == 60) {
			percent = 0;
			incrementingMinutes(ProgressBars.find(e => e.id == bar.id && e.type == 'minutes'))
		}

		bar.bar.animate(percent / 60);
		bar.bar.setText(percent);
		setTimeout(tick, 1000);
	}
	setTimeout(tick, 1000);
}

function incrementingMinutes(bar) {
	let hourValue = +bar.bar.text?.textContent + 1;

	let percent = (hourValue / 60);

	if (percent == 1) {
		percent = 0;
		hourValue = 0;
	}

	bar.bar.animate(percent);
	bar.bar.setText(hourValue);

}

function openCreateActivityForm(categoryId) {
	const { DateTime } = luxon;

	document.getElementById('activityCategoryId').value = categoryId;
	document.getElementById('activityLastUpdateDate').value = DateTime.now().toFormat('yyyy-MM-dd');
	document.getElementById('activityLastUpdateTime').value = DateTime.now().toFormat('HH:mm:ss');
	document.getElementById('createActivityContainer').classList.remove('off');
}

async function createActivity() {

	const categoryId = document.getElementById('activityCategoryId').value;
	const activityName = document.getElementById('activityName').value;

	const rq = await fetch("api/activity/createActivity.php", {
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		method: "POST",
		body: JSON.stringify({
			...getUserAuthentication(),
			activity: {
				category: categoryId,
				name: activityName
			}
		})
	});

	const rs = await rq.json();//TODO add to dom

}

async function updateTimeActivity(activityId){

	const rq = await fetch("api/activity/updateActivity.php", {
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		method: "POST",
		body: JSON.stringify({
			...getUserAuthentication(),
			activity: {
				id: activityId
			}
		})
	});

	const rs = await rq.json();//TODO add to dom
}