<script>
    import "../app.css";
    import Navbar from "$lib/Navbar.svelte";
    import Sidebar from "$lib/Sidebar.svelte";
</script>

<Navbar />
<div class="main-container">
    <Sidebar />
    <slot />
</div>

<style>
    .main-container {
        width: 100%;
        display: flex;
    }
</style>
