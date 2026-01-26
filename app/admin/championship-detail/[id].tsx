import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../src/services/api';

interface Category {
    id: number;
    name: string;
    description?: string;
    min_age?: number;
    max_age?: number;
    gender?: 'M' | 'F' | 'MIXED';
    max_teams?: number;
    teams_count?: number;
}

interface Championship {
    id: number;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    location?: string;
    sport_id: number;
    format: 'league' | 'knockout' | 'groups';
    status: 'upcoming' | 'ongoing' | 'finished';
    max_teams?: number;
    registration_fee?: number;
}

export default function ChampionshipDetail() {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [championship, setChampionship] = useState<Championship | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<'info' | 'categories' | 'format'>('info');

    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [format, setFormat] = useState<'league' | 'knockout' | 'groups'>('league');
    const [maxTeams, setMaxTeams] = useState('');
    const [registrationFee, setRegistrationFee] = useState('');

    // Category form
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [minAge, setMinAge] = useState('');
    const [maxAge, setMaxAge] = useState('');
    const [categoryGender, setCategoryGender] = useState<'M' | 'F' | 'MIXED'>('MIXED');
    const [categoryMaxTeams, setCategoryMaxTeams] = useState('');

    useEffect(() => {
        loadChampionship();
        loadCategories();
    }, [id]);

    const loadChampionship = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/championships/${id}`);
            const data = response.data;
            setChampionship(data);

            // Preenche formulário
            setName(data.name);
            setDescription(data.description || '');
            setLocation(data.location || '');
            setStartDate(data.start_date);
            setEndDate(data.end_date);
            setFormat(data.format);
            setMaxTeams(data.max_teams?.toString() || '');
            setRegistrationFee(data.registration_fee?.toString() || '');
        } catch (error) {
            console.error('Erro ao carregar campeonato:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados do campeonato.');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await api.get(`/admin/championships/${id}/categories-list`);
            setCategories(response.data);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Atenção', 'O nome do campeonato é obrigatório.');
            return;
        }

        try {
            setSaving(true);
            await api.put(`/admin/championships/${id}`, {
                name,
                description,
                location,
                start_date: startDate,
                end_date: endDate,
                format,
                max_teams: maxTeams ? parseInt(maxTeams) : null,
                registration_fee: registrationFee ? parseFloat(registrationFee) : null,
            });

            Alert.alert('Sucesso', 'Campeonato atualizado com sucesso!');
            loadChampionship();
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível salvar as alterações.');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!categoryName.trim()) {
            Alert.alert('Atenção', 'O nome da categoria é obrigatório.');
            return;
        }

        try {
            await api.post(`/admin/championships/${id}/categories-new`, {
                name: categoryName,
                description: categoryDescription,
                min_age: minAge ? parseInt(minAge) : null,
                max_age: maxAge ? parseInt(maxAge) : null,
                gender: categoryGender,
                max_teams: categoryMaxTeams ? parseInt(categoryMaxTeams) : null,
            });

            Alert.alert('Sucesso', 'Categoria criada com sucesso!');
            setShowCategoryForm(false);
            resetCategoryForm();
            loadCategories();
        } catch (error: any) {
            console.error('Erro ao criar categoria:', error);
            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível criar a categoria.');
        }
    };

    const handleDeleteCategory = async (categoryId: number) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir esta categoria?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/championships/${id}/categories/${categoryId}`);
                            Alert.alert('Sucesso', 'Categoria excluída com sucesso!');
                            loadCategories();
                        } catch (error: any) {
                            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível excluir a categoria.');
                        }
                    },
                },
            ]
        );
    };

    const resetCategoryForm = () => {
        setCategoryName('');
        setCategoryDescription('');
        setMinAge('');
        setMaxAge('');
        setCategoryGender('MIXED');
        setCategoryMaxTeams('');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalhes do Campeonato</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color="#3b82f6" />
                    ) : (
                        <Ionicons name="checkmark" size={24} color="#10b981" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'info' && styles.tabActive]}
                    onPress={() => setActiveTab('info')}
                >
                    <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
                        Informações
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'categories' && styles.tabActive]}
                    onPress={() => setActiveTab('categories')}
                >
                    <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>
                        Categorias
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'format' && styles.tabActive]}
                    onPress={() => setActiveTab('format')}
                >
                    <Text style={[styles.tabText, activeTab === 'format' && styles.tabTextActive]}>
                        Formato
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Tab: Informações */}
                {activeTab === 'info' && (
                    <View style={styles.tabContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nome do Campeonato *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ex: Copa Verão 2026"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Descrição</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Descrição do campeonato..."
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Local</Text>
                            <TextInput
                                style={styles.input}
                                value={location}
                                onChangeText={setLocation}
                                placeholder="Ex: Ginásio Municipal"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Data Início</Text>
                                <TextInput
                                    style={styles.input}
                                    value={startDate}
                                    onChangeText={setStartDate}
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Data Fim</Text>
                                <TextInput
                                    style={styles.input}
                                    value={endDate}
                                    onChangeText={setEndDate}
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Máx. Equipes</Text>
                                <TextInput
                                    style={styles.input}
                                    value={maxTeams}
                                    onChangeText={setMaxTeams}
                                    placeholder="Ex: 16"
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Taxa Inscrição (R$)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={registrationFee}
                                    onChangeText={setRegistrationFee}
                                    placeholder="Ex: 150.00"
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Tab: Categorias */}
                {activeTab === 'categories' && (
                    <View style={styles.tabContent}>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setShowCategoryForm(!showCategoryForm)}
                        >
                            <Ionicons name="add-circle" size={24} color="#3b82f6" />
                            <Text style={styles.addButtonText}>Nova Categoria</Text>
                        </TouchableOpacity>

                        {showCategoryForm && (
                            <View style={styles.categoryForm}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Nome da Categoria *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={categoryName}
                                        onChangeText={setCategoryName}
                                        placeholder="Ex: Sub-17 Masculino"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Descrição</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={categoryDescription}
                                        onChangeText={setCategoryDescription}
                                        placeholder="Descrição da categoria..."
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, styles.halfWidth]}>
                                        <Text style={styles.label}>Idade Mínima</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={minAge}
                                            onChangeText={setMinAge}
                                            placeholder="Ex: 15"
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    <View style={[styles.inputGroup, styles.halfWidth]}>
                                        <Text style={styles.label}>Idade Máxima</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={maxAge}
                                            onChangeText={setMaxAge}
                                            placeholder="Ex: 17"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Gênero</Text>
                                    <View style={styles.genderButtons}>
                                        {(['M', 'F', 'MIXED'] as const).map((g) => (
                                            <TouchableOpacity
                                                key={g}
                                                style={[
                                                    styles.genderButton,
                                                    categoryGender === g && styles.genderButtonActive,
                                                ]}
                                                onPress={() => setCategoryGender(g)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.genderButtonText,
                                                        categoryGender === g && styles.genderButtonTextActive,
                                                    ]}
                                                >
                                                    {g === 'M' ? 'Masculino' : g === 'F' ? 'Feminino' : 'Misto'}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.formActions}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            setShowCategoryForm(false);
                                            resetCategoryForm();
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.createButton}
                                        onPress={handleCreateCategory}
                                    >
                                        <Text style={styles.createButtonText}>Criar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Lista de Categorias */}
                        {categories.map((category) => (
                            <View key={category.id} style={styles.categoryCard}>
                                <View style={styles.categoryHeader}>
                                    <Text style={styles.categoryName}>{category.name}</Text>
                                    <TouchableOpacity onPress={() => handleDeleteCategory(category.id)}>
                                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                                {category.description && (
                                    <Text style={styles.categoryDescription}>{category.description}</Text>
                                )}
                                <View style={styles.categoryMeta}>
                                    {category.min_age && category.max_age && (
                                        <Text style={styles.categoryMetaText}>
                                            Idade: {category.min_age}-{category.max_age} anos
                                        </Text>
                                    )}
                                    {category.gender && (
                                        <Text style={styles.categoryMetaText}>
                                            {category.gender === 'M'
                                                ? 'Masculino'
                                                : category.gender === 'F'
                                                    ? 'Feminino'
                                                    : 'Misto'}
                                        </Text>
                                    )}
                                    <Text style={styles.categoryMetaText}>
                                        {category.teams_count || 0} equipes
                                    </Text>
                                </View>
                            </View>
                        ))}

                        {categories.length === 0 && !showCategoryForm && (
                            <View style={styles.emptyState}>
                                <Ionicons name="folder-open-outline" size={64} color="#d1d5db" />
                                <Text style={styles.emptyStateText}>Nenhuma categoria criada</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Tab: Formato */}
                {activeTab === 'format' && (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>Formato do Campeonato</Text>

                        {(['league', 'knockout', 'groups'] as const).map((f) => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.formatCard, format === f && styles.formatCardActive]}
                                onPress={() => setFormat(f)}
                            >
                                <View style={styles.formatHeader}>
                                    <Ionicons
                                        name={
                                            f === 'league'
                                                ? 'list'
                                                : f === 'knockout'
                                                    ? 'git-network'
                                                    : 'grid'
                                        }
                                        size={32}
                                        color={format === f ? '#3b82f6' : '#6b7280'}
                                    />
                                    <View style={styles.formatInfo}>
                                        <Text style={[styles.formatName, format === f && styles.formatNameActive]}>
                                            {f === 'league'
                                                ? 'Pontos Corridos'
                                                : f === 'knockout'
                                                    ? 'Mata-Mata'
                                                    : 'Grupos + Mata-Mata'}
                                        </Text>
                                        <Text style={styles.formatDescription}>
                                            {f === 'league'
                                                ? 'Todos jogam contra todos'
                                                : f === 'knockout'
                                                    ? 'Eliminação direta'
                                                    : 'Fase de grupos seguida de eliminatórias'}
                                        </Text>
                                    </View>
                                </View>
                                {format === f && (
                                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#3b82f6',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#3b82f6',
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        marginBottom: 16,
    },
    addButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#3b82f6',
    },
    categoryForm: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    genderButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    genderButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        alignItems: 'center',
    },
    genderButtonActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    genderButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    genderButtonTextActive: {
        color: '#fff',
    },
    formActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    createButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    categoryCard: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
    },
    categoryDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    categoryMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryMetaText: {
        fontSize: 12,
        color: '#9ca3af',
    },
    emptyState: {
        paddingVertical: 64,
        alignItems: 'center',
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: '#9ca3af',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
    },
    formatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        marginBottom: 12,
    },
    formatCardActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
    },
    formatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    formatInfo: {
        marginLeft: 16,
        flex: 1,
    },
    formatName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    formatNameActive: {
        color: '#3b82f6',
    },
    formatDescription: {
        fontSize: 14,
        color: '#6b7280',
    },
});
