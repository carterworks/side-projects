<template>
<body class="background">
	<header>
		<h1>Dice Rolling</h1>
	</header>
	<main>
		<ul class="dice">
			<li v-for="group in diceGroups" :key="group.id">
				<DiceGroup @delete="deleteGroup(group)"/>
			</li>
			<li class="add-group-button__container">
				<button class="add-group-button" @click="addGroup">Add group</button>
			</li>
		</ul>
	</main>
</body>
</template>

<script>
import DiceGroup from "./DiceGroup.vue";
let groupId = 0;
export default {
	components: { DiceGroup },
	data() {
		return {
			diceGroups: [
				{
					id: groupId++
				}
			]
		};
	},
	methods: {
		addGroup() {
			this.diceGroups.push({
				id: new Date().toString()
			});
		},
		deleteGroup(group) {
			this.diceGroups = this.diceGroups.filter(
				ogGroup => ogGroup.id !== group.id
			);
		}
	},
	name: "App"
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Open+Sans");

.background {
	background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
		url("https://source.unsplash.com/CltI5xgDAs0/1920x1080") fixed no-repeat
			center center;
}
body {
	align-items: center;
	color: #ffffff;
	display: flex;
	flex-direction: column;
	font-family: "Open Sans", sans-serif;
	margin: 0;
	padding: 16px;
}
.dice {
	list-style: none;
	padding: 0;
}
.add-group-button__container {
	display: flex;
	margin-top: 8px;
	justify-content: center;
	width: 100%;
}

@media (min-width: 500px) {
	.dice {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
	}
}
</style>
