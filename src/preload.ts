import { InitPlugins } from "utools-helper";
import { Add } from "./add";

try {
    InitPlugins([new Add()]);
} catch (error) {
    alert(error.message + error.stack);
}