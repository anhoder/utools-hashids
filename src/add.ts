import { HashDBItem, Hashid } from "./hashids"
import { Plugin, ListItem, IListItem } from "utools-helper"
import { TplFeatureMode, Action } from "utools-helper/@types/utools"

export class Add implements Plugin {

    code = "add"
    mode = <TplFeatureMode>"list"
    placeholder = ""

    hashidItem: HashDBItem
    step = 0

    enter?(action?: Action<any>): void | IListItem<any> | Promise<IListItem<any>> | IListItem<any>[] | Promise<IListItem<any>[]> {

        this.hashidItem = new HashDBItem(new Hashid("", "", 0))
        return this.search("")

    }
    search?(word: string, action?: Action<any>): void | IListItem<any> | Promise<IListItem<any>> | IListItem<any>[] | Promise<IListItem<any>[]> {

        switch (this.step) {
            case 0:
                // 输入名称
                this.placeholder = "请输入名称"
                return [new ListItem(`名称: ${word}`, word)]
            case 1:
                // 输入salt
                this.placeholder = "请输入salt"
                return [new ListItem(`salt: ${word}`, word)]
            case 2:
                // 输入最小长度
                this.placeholder = "请输入最小长度"
                return [new ListItem(`最小长度: ${word}`, word)]

        }

    }
    select?(item: IListItem<any>, action?: Action<any>): void | IListItem<any> | Promise<IListItem<any>> | IListItem<any>[] | Promise<IListItem<any>[]> {

        switch (this.step) {
            case 0:
                // 完成名称输入
                this.hashidItem.data.name = item.data
                this.step++
                return this.search("")
            case 1:
                // 完成salt输入
                this.hashidItem.data.salt = item.data
                this.step++
                return this.search("")
            case 2:
                // 完成最小长度输入
                this.hashidItem.data.minLength = item.data
                this.step = 0
                let res = this.hashidItem.save()
                if (!res.ok) {
                    throw new Error("保存失败")
                }
                utools.redirect("haen", "")
        }

    }

}