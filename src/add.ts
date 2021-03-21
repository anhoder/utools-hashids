import { HashDBItem, Hashid } from "./hashids"
import { Plugin, ListItem, IListItem } from "utools-helper"
import { TplFeatureMode, Action } from "utools-helper/@types/utools"

let tips = new Map([
    [0, "「请输入名称」"],
    [1, "「请输入salt」"],
    [2, "「请输入最小长度」"],
])

export class Add implements Plugin {

    code = "add"
    mode = <TplFeatureMode>"list"
    placeholder = "请输入"

    hashidItem: HashDBItem
    step = 0

    enter?(action?: Action<any>): void | IListItem<any> | Promise<IListItem<any>> | IListItem<any>[] | Promise<IListItem<any>[]> {

        this.hashidItem = new HashDBItem(new Hashid("", "", 0))
        this.step = 0
        return this.search("")

    }
    search?(word: string, action?: Action<any>): void | IListItem<any> | Promise<IListItem<any>> | IListItem<any>[] | Promise<IListItem<any>[]> {

        switch (this.step) {
            case 0:
                // 输入名称
                return [new ListItem(`名称: ${word}`, word ? word : tips.get(this.step))]
            case 1:
                // 输入salt
                return [new ListItem(`salt: ${word}`, word ? word : tips.get(this.step))]
            case 2:
                // 输入最小长度
                return [new ListItem(`最小长度: ${word}`, word ? word : tips.get(this.step))]

        }

    }
    select?(item: IListItem<any>, action?: Action<any>): void | IListItem<any> | Promise<IListItem<any>> | IListItem<any>[] | Promise<IListItem<any>[]> {

        if (item.data == "" || item.data == tips.get(this.step)) {
            utools.showNotification("输入不得为空")
            return
        }

        switch (this.step) {
            case 0:
                // 完成名称输入
                this.hashidItem.data.name = item.data
                if (HashDBItem.search(item.data).length > 0) {
                    utools.showNotification("这个名称被用过啦, 换个吧~")
                    return
                }

                this.step++
                utools.setSubInputValue("")
                return this.search("")
            case 1:
                // 完成salt输入
                this.hashidItem.data.salt = item.data
                this.step++
                utools.setSubInputValue("")
                return this.search("")
            case 2:
                // 完成最小长度输入
                let minLength = new Number(item.data)
                if (isNaN(<number>minLength)) {
                    utools.showNotification("最小长度必须是数字")
                    return
                }
                this.hashidItem.data.minLength = <number>minLength
                console.log(this.hashidItem.data)
                this.step = 0
                utools.setSubInputValue("")
                let res = this.hashidItem.save()
                if (!res.ok) {
                    console.log(res)
                    throw new Error("保存失败")
                }
                utools.redirect("haen", "")
        }

    }

}