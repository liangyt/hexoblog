Vue.transition('test', {
    beforeEnter:function(el) {
        console.log("beforeEnter");
    },
    enter:function(el) {
        console.log("enter");
    },
    afterEnter:function(el) {
        console.log("afterEnter");
    },
    beforeLeave:function(el) {
        console.log("beforeLeave");
    },
    leave:function(el) {
        console.log("leave");
    },
    afterLeave:function(el) {
        console.log("afterLeave");
    }
});

var row = Vue.extend({
    template:'#row',
    data:function() {
        return {
            noEdit:true
        }
    },
    props:{
        row:{
            type:String
        },
        ind:null
    },
    methods:{
        edit:function() {
            this.noEdit = false;
        },
        finish:function() {
            this.noEdit = true;
        },
        del:function() {
            this.$dispatch("del-event", this.ind);
        }
    }
});

var app = new Vue({
    el:'#app',
    components:{
        "row-item":row
    },
    data:{
        enterText:'',
        rows:[],
        search:''
    },
    methods:{
        ok:function() {
            if(this.enterText == "") return false;
            this.rows.push(this.enterText);
            this.enterText = '';
        }
    },
    created:function() {
        console.log("created");
    },
    ready:function() {

    },
    events:{
        'del-event':function(index) {
            this.rows.splice(index,1);
        }
    }
})