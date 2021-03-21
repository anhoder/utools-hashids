import { DBItem } from "utools-helper/@types/utools"
import Hashids from "hashids"

export class Hashid {
    name: string
    salt: string
    minLength: number
    private decodedId: number | bigint
    private encodedHashid: string

    constructor(name: string, salt: string, minLength: number) {
        this.name = name
        this.salt = salt
        this.minLength = minLength
    }

    set id(id: number | bigint) {
        this.decodedId = id
        let hashids = new Hashids(this.salt, this.minLength)
        this.encodedHashid = hashids.encode(this.decodedId)
    }

    set hashid(hashid: string) {
        this.encodedHashid = hashid
        let hashids = new Hashids(this.salt, this.minLength)
        let result = hashids.decode(this.encodedHashid)
        this.decodedId = result.length > 0 ? result[0] : 0
    }

    get id(): number | bigint {
        return this.decodedId
    }

    get hashid(): string {
        return this.encodedHashid
    }

}

export class HashDBItem implements DBItem<Hashid> {
    _id: string
    _rev: string
    data: Hashid

    ok?: Boolean
    error?: string

    constructor(hashid: Hashid) {
        this._id = hashid.name
        this.data = hashid

        let data = utools.db.get(this._id)
        if (data) this._rev = data._rev
    }

    save() {
        if (!this._id) this._id = this.data.name
        let res = utools.db.put<Hashid>(this)
        if (!res.ok) {
            throw res.error
        }
        return res
    }

    static search(name?: string): HashDBItem[] {
        return utools.db.allDocs<Hashid>(name).map(
            (item: DBItem<Hashid>): HashDBItem => {
                item.data = new Hashid(item.data.name, item.data.salt, item.data.minLength)
                return item as HashDBItem
            }
        )
    }
}