import { HashDBItem, Hashid } from "./hashids"
import { Plugin, ListItem, IListItem } from "utools-helper"
import { TplFeatureMode, Action, DBItem } from "utools-helper/@types/utools"
import Item from "./item"
import { clipboard } from "electron"
import { EnterKey, resetEnterKey } from "./key"

let operates = new Map([
    [
        'command',
        (item: Item<DBItem<Hashid>>) => {
            let res = utools.db.remove(item.data._id)
            let msg = "删除成功"
            if (!res.ok) msg = "删除失败: " + res.error
            console.log(res, item)
            utools.showNotification(msg)
        }
    ],
    [
        'enter',
        (item: Item<DBItem<Hashid>>) => {
            clipboard.writeText(item.data.data.id.toString())
            utools.showNotification(`开发: ${item.data.data.id} 复制成功`)
        }
    ]
])

export class Decode implements Plugin {

    code = "decode"
    mode = <TplFeatureMode>"list"
    placeholder = "请输入需要解码的Hashid"

    hasId = false
    items: DBItem<Hashid>[]

    enter?(action?: Action<any>): void | IListItem<any> | Promise<IListItem<any>> | IListItem<any>[] | Promise<IListItem<any>[]> {
        this.items = HashDBItem.search()
        let word = ""
        if (typeof action === 'object' && action.type === 'regex') {
            word = action.payload
        }
        return this.search(word)
    }
    search?(word: string, action?: Action<any>): void | IListItem<any> | Promise<IListItem<any>> | IListItem<any>[] | Promise<IListItem<any>[]> {
        word = word.trim()
        return this.items.map(
            (item: DBItem<Hashid>): ListItem => {
                let hashid = <Hashid>item.data
                let text = ""
                let reg = /^[0-9a-zA-Z]+$/g;
                if (word != "" && reg.test(word)) {
                    this.hasId = true
                    hashid.hashid = word
                    text = hashid.id.toString()
                } else {
                    this.hasId = false
                    text = "格式有误"
                }
                let res = new Item<DBItem<Hashid>>(item._id, item)
                res.description = text + " (enter: 复制解码结果, command/ctrl + enter: 删除所选配置)"
                return res
            }
        )
    }
    select?(item: IListItem<any>, action?: Action<any>): void | IListItem<any> | Promise<IListItem<any>> | IListItem<any>[] | Promise<IListItem<any>[]> {

        let callback = operates.get(EnterKey)

        if (EnterKey === "command") {
            callback(item)
            resetEnterKey()
            this.items = HashDBItem.search()
            utools.setSubInputValue("")
            return this.search("")
        } else if (EnterKey === "enter" && this.hasId) {
            callback(item)
            resetEnterKey()
            utools.hideMainWindow()
            utools.outPlugin()
            return
        }

    }

}