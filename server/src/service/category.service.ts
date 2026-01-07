import { db } from '../config/firebase';
import { getFormattedDateForAccount } from '../common/utils';
import { Category } from '../types/category';
import { CATEGORY_LIMIT_COUNT_BASE, CATEGORY_MENU_BASE_CAFE, CATEGORY_MENU_BASE_ETC, CATEGORY_MENU_BASE_FOOD, CATEGORY_MENU_BASE_HOTEL, CATEGORY_MENU_BASE_TOUR } from '../common/constants';

const categoryCollection = db.collection('categories');

export const init = async (id: string): Promise<void> => {
    const ref = categoryCollection.doc(id)
    const doc = await ref.get()
    if (doc.exists) {
        return
    } else {
        const time = new Date()
        const CATEGORY_MENU_BASE_ARR: { id: number, title: string }[] = [
            { "id": new Date().getTime(), "title": CATEGORY_MENU_BASE_FOOD },
            { "id": new Date().getTime()+1, "title": CATEGORY_MENU_BASE_CAFE },
            { "id": new Date().getTime()+2, "title": CATEGORY_MENU_BASE_HOTEL },
            { "id": new Date().getTime()+3, "title": CATEGORY_MENU_BASE_TOUR },
            { "id": new Date().getTime()+4, "title": CATEGORY_MENU_BASE_ETC }
        ]
        const category: Category = {
            id: id,
            list: CATEGORY_MENU_BASE_ARR,
            created: getFormattedDateForAccount(time),
            updated: getFormattedDateForAccount(time)
        }
        await createNewCategory(category)
    }
}

export const findCategoryById = async (id: string): Promise<Category> => {
    const doc = await categoryCollection.doc(id).get()
    return doc.data() as Category
};

export const createNewCategory = async (categoryData: Category): Promise<Category | null> => {
    try {
        categoryData.created = getFormattedDateForAccount(new Date())
        categoryData.updated = categoryData.created
        await categoryCollection.doc(categoryData.id).set(categoryData);
        return categoryData
    } catch (e) {
        console.log(e)
    }

    return null
};


export const updateCategory = async (id: string, updateData: Partial<Omit<Category, 'id'>>): Promise<Category | null> => {
    const docRef = categoryCollection.doc(id);
    updateData.updated = getFormattedDateForAccount(new Date())
    await docRef.update(updateData);

    // 업데이트된 장소 정보를 다시 가져와 반환
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...(updatedDoc.data() as Omit<Category, 'id'>) };
};

export const deleteCategory = async (id: string): Promise<boolean> => {
    const docRef = categoryCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
        return false; // 장소를 찾을 수 없음
    }
    await docRef.delete();
    return true;
};

