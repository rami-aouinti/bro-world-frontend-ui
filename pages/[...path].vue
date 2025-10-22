<script setup lang="ts">
import { createError } from "#app";

throw createError({
  statusCode: 404,
  statusMessage: "Not Found",
  fatal: true,
});
</script>
