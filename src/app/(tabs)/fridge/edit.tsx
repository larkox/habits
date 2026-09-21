import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import InputCalendar from '@/components/base/InputCalendar';
import Loader from '@/components/base/Loader';
import View from '@/components/base/View';
import useSmartLoading from '@/hooks/useSmartLoading';
import useStorageMutation from "@/hooks/useStorageMutation";
import { useFood } from '@/store/hooks';
import { updateFoodFromFridge } from '@/store/storage';
import type { FridgeFood } from '@/types/model';
import { normalizeRequiredText } from '@/utils/validation';

type FormErrors = {
    name?: string;
};

type SaveButtonProps = {
    loading: boolean;
    onPress: () => void;
}

function SaveButton({
    loading,
    onPress,
}: SaveButtonProps) {
    const [t] = useTranslation();

    return (
        <Button
            text={t('fridge.editFood.saveButton')}
            onPress={onPress}
            loading={loading}
        />
    )
}
export default function EditScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const food = useFood(id);
    const loading = useSmartLoading(food === undefined);

    if (loading.isLoading || !food) {
        return loading.showLoader ? <Loader /> : null;
    }

    return <FoodForm
        key={food.id}
        food={food}
    />;
}

function FoodForm({food}: {food: FridgeFood}) {
    const mutation = useStorageMutation();
    const [errors, setErrors] = useState<FormErrors>({});
    const id = food.id;
    const navigation = useNavigation();
    const [name, setName] = useState(food.name)
    const [expiryDate, setExpiryDate] = useState(food.date);
    const [t] = useTranslation();
    const router = useRouter();

    const save = useCallback(async () => {
        const normalizedName = normalizeRequiredText(name);
        setErrors({name: normalizedName ? undefined : t('validation.required')});
        if (!normalizedName) {
            return;
        }
        const saved = await mutation.run(() => updateFoodFromFridge(id, normalizedName, expiryDate));
        if (saved) {
            router.back();
        }
    }, [expiryDate, id, mutation, name, router, t]);

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                loading={mutation.isPending}
                onPress={save}
            />
        )})
    }, [mutation.isPending, navigation, save])

    return (
        <View
            style={styles.container}
        >
            <Input
                label={t('fridge.addFood.inputLabels.name')}
                onChange={setName}
                value={name}
                type='text'
                error={errors.name}
            />
            <InputCalendar
                label={t('fridge.addFood.inputLabels.expiryDate')}
                setValue={setExpiryDate}
                value={expiryDate}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 8,
    },
    deletecontainer: {
        marginTop: 'auto',
    }
});
