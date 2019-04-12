<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *">
            <Label class="title" text="Interview.me" row="0" horizontalAlignment="center" />

            <StackLayout orientation="vertical" verticalAlignment="center" row="1">
                <Button class="btn" text="COMMENCER UNE ENTREVUE" />
                <Button class="btn" text="VOIR MES ENTREVUES" marginTop="30" />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>
@import '../app.scss';

.title {
    color: $app-color;
    font-weight: bold;
    font-size: 42;
}

.btn {
    color: #fff;
    background-color: $app-color;
    height: 60;
    border-radius: 10;
}
</style>


