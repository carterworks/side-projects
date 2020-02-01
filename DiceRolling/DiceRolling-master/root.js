import "babel-polyfill";
import Vue from "vue";
import App from "./components/App.vue";

new Vue({
	el: "#root",
	render: h => h(App)
});
