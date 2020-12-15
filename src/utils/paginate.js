import _ from 'lodash';

export function paginate(items, pageNum, pageSize) {
    const startIndex = (pageNum - 1) * pageSize;
    let endIndex = startIndex + (pageSize);
    endIndex = endIndex > items.length ? items.length : endIndex;
    return _.slice(items, startIndex, endIndex);
}