<template>
	<li class="group">
		<div class="name">
			<label class="value-input__container">
				<span class="label__text">Name: </span>
				<input class="value-input" type="text" v-model="name">
			</label>
		</div>
		<div class="quantity">
			<label class="value-input__container">
				<span class="label__text">Quantity: </span>
				<input class="value-input" v-model="quantity" type="number" min="0">
			</label>
		</div>
		<div class="range">
			<label class="value-input__container">
				<span class="label__text">Min:</span>
				<input class="value-input" v-model="minimum" type="number" min="0">
			</label>
			<label class="value-input__container">
				<span class="label__text">Max:</span>
				<input class="value-input" v-model="maximum" type="number" :min="minimum + 1">
			</label>
		</div>
		<div class="roll__container">
			<button class="results__button" @click="rollDice">Roll!</button>
		</div>
		<div class="results__container" v-if="results.length">
			<h3 class="results__title">Results</h3>
			<div class="results">
				{{resultsStr}}
			</div>
		</div>
		<div class="delete-button__container">
			<button class="delete-button" @click="deleteGroup">Delete Group</button>
		</div>
	</li>
</template>

<script>
export default {
	computed: {
		resultsStr() {
			return this.results.join(", ");
		}
	},
	data() {
		return {
			maximum: 6,
			minimum: 1,
			name: "Move Spaces",
			quantity: 1,
			results: []
		};
	},
	methods: {
		decrement(field) {
			field += 1;
		},
		deleteGroup() {
			this.$emit("delete");
		},
		increment(field) {
			if (field > 1) {
				field -= 1;
			}
		},
		rollDice() {
			this.results = [];
			for (let i = 0; i < this.quantity; ++i) {
				this.results.push(getRandomInt(this.minimum, this.maximum));
			}
		}
	},
	name: "DiceGroup"
};

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
</script>

<style>
.group {
	background: rgba(0, 0, 0, 0.3);
	border-radius: 8px;
	margin: 4px 4px;
	padding: 16px;
	text-align: center;
}
.group > * {
	margin-top: 8px;
}
.range > * {
	display: block;
	margin-top: 4px;
}
.value-input__container {
	align-items: center;
	display: flex;
	flex-direction: column;
	justify-content: center;
}
</style>
