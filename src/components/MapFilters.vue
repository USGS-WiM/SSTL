<template>
  <v-expansion-panels>
    <!-- Basemap Section -->
    <v-expansion-panel>
      <v-expansion-panel-header>
        Basemaps
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-container class="px-0" fluid>
          <v-checkbox
            v-model="checkbox"
            :label="`Checkbox 1`"
          ></v-checkbox>
        </v-container>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <!-- Filters Section -->
    <v-expansion-panel>
      <v-expansion-panel-header>
        Streamgages
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-container class="px-0" fluid>
          <v-checkbox
            v-model="checkbox"
            :label="`Checkbox 1`"
          ></v-checkbox>
        </v-container>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
  export default {
    data () {
      return {
        checkbox: true,
      }
    },
  }
</script>