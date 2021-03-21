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
            clipboard.writeText(item.data.data.hashid)
            utools.showNotification(`开发: ${item.data.data.hashid} 复制成功`)
        }
    ]
])

export class Encode implements Plugin {

    code = "encode"
    mode = <TplFeatureMode>"list"
    placeholder = "请输入需要编码的ID"

    hasHashid = false
    items: DBItem<Hashid>[]

    enter?(action?: Action<any>): void | IListItem<any> | Promise<IListItem<any>> | IListItem<any>[] | Promise<IListItem<any>[]> {
        this.items = HashDBItem.search()
        return this.search(action.payload || "")
    }
    search?(word: string, action?: Action<any>): void | IListItem<any> | Promise<IListItem<any>> | IListItem<any>[] | Promise<IListItem<any>[]> {
        return this.items.map(
            (item: DBItem<Hashid>): ListItem => {
                let hashid = <Hashid>item.data
                let id = new Number(word)
                let text = ""
                if (word != "") {
                    if (isNaN(<number>id)) {
                        this.hasHashid = false
                        hashid.id = undefined
                        text = "输入整数"
                    } else {
                        this.hasHashid = true
                        hashid.id = <number>id
                        text = hashid.hashid
                    }
                } else {
                    this.hasHashid = false
                }
                let res = new Item<DBItem<Hashid>>(item._id, item)
                res.description = text + " (enter: 复制编码结果, command/ctrl + enter: 删除所选配置)"
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
        } else if (EnterKey === "enter" && this.hasHashid) {
            callback(item)
            resetEnterKey()
            utools.hideMainWindow()
            utools.outPlugin()
            return
        }

    }

}