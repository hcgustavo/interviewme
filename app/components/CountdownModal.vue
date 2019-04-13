<template>
    <Page @loaded="onPageLoaded">
        <GridLayout rows="*">
            <Label 
            class="count"
            verticalAlignment="center" 
            horizontalAlignment="center"
            v-model="count" />
        </GridLayout>
    </Page>
</template>

<script>
export default {
    data() {
        return {
            count: 3,
        }
    },

    methods: {
        onPageLoaded() {
            let myInterval = setInterval(() => {
                if(this.count <= 0) {
                    clearInterval(myInterval);
                    this.$modal.close();
                }
                this.count--;
            }, 1000)
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../app.scss';

.count {
    color: $app-color;
    font-weight: bold;
    font-size: 42;
}
</style>


