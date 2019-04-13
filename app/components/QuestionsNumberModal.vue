<template>
    <Page>
        <GridLayout rows="auto, *, auto" padding="0">
            <Label 
            class="title"
            textWrap="true"
            text="Combien de questions voulez-vous répondre?" 
            horizontalAlignment="center" 
            row="0" />

            <ListPicker 
            :items="listOfItems" 
            selectedIndex="0"
            @selectedIndexChange="selectedIndexChanged"
            row="1" />

            <Button
            text="COMMENCER"
            @tap="start"
            row="2" />
        </GridLayout>
    </Page>
</template>

<script>
export default {
    data() {
        return {
            listOfItems: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            selectedItem: 5,
        }
    },

    methods: {
        selectedIndexChanged(args) {
            this.selectedItem = this.listOfItems[args.object.selectedIndex];
        },

        start() {
            this.$modal.close(this.selectedItem);
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../app.scss';

Button {
    margin: 0;
    background-color: $app-color;
    color: #fff;
}

.title {
    margin-top: 20;
    color: $app-color;
    font-weight: bold;
    font-size: 22;
    text-align: center;
}
</style>


