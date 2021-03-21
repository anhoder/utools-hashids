import { InitPlugins } from "utools-helper"
import { Add } from "./add"
import { Encode } from "./encode"
import { Decode } from "./decode"

try {
    InitPlugins([new Add, new Encode, new Decode])
} catch (error) {
    alert(error.message + error.stack)
}