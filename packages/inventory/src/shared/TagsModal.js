import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { toggleTagModal, fetchAllTags, loadTags } from '../redux/actions';
import { TagModal } from '@redhat-cloud-services/frontend-components/components/cjs/TagModal';
import { cellWidth } from '@patternfly/react-table';
import debounce from 'lodash/debounce';
import flatten from 'lodash/flatten';

class TagsModal extends React.Component {
    state = {
        filterTagsBy: '',
        selected: []
    }

    debouncedFetch = debounce((pagination) => this.fetchTags(pagination), 800);

    fetchTags = (pagination) => {
        const { filterTagsBy } = this.state;
        const { fetchAllTags, fetchTagsForSystem, activeSystemTag, tagsCount, filters, customFilters } = this.props;
        if (!activeSystemTag) {
            fetchAllTags(filterTagsBy, { ...customFilters, pagination, filters });
        } else {
            fetchTagsForSystem(activeSystemTag.id, filterTagsBy, { pagination }, tagsCount);
        }
    };

    componentDidUpdate(prevProps) {
        if (prevProps.filterTagsBy !== this.props.filterTagsBy) {
            this.setState({ filterTagsBy: this.props.filterTagsBy });
        }
    }

    componentDidMount() {
        if (this.props.filterTagsBy) {
            this.setState({ filterTagsBy: this.props.filterTagsBy });
        }
    }

    render() {
        const {
            showTagDialog,
            tags,
            activeSystemTag,
            tagsCount,
            onToggleTagModal,
            onToggleModal,
            pagination,
            loaded,
            onApply
        } = this.props;
        const { filterTagsBy, selected } = this.state;
        return (
            <TagModal
                className="ins-c-inventory__tags-modal"
                tableProps={{
                    canSelectAll: false
                }}
                {...loaded && {
                    loaded,
                    pagination: {
                        ...pagination,
                        count: tagsCount
                    },
                    rows: tags.map(({ key, value, namespace }) => ({
                        id: `${namespace}/${key}=${value}`,
                        selected: selected.find(({ id }) => id === `${namespace}/${key}=${value}`),
                        cells: [ key, value, namespace ]
                    }))
                }}
                loaded={ loaded }
                width="auto"
                isOpen={ showTagDialog }
                toggleModal={() => {
                    this.setState({
                        selected: [],
                        filterTagsBy: ''
                    });
                    onToggleModal();
                    onToggleTagModal();
                }}
                filters={[
                    {
                        label: 'Tags filter',
                        placeholder: 'Filter tags',
                        value: 'tags-filter',
                        filterValues: {
                            value: filterTagsBy,
                            onChange: (_e, value) => {
                                this.debouncedFetch(pagination);
                                this.setState({ filterTagsBy: value });
                            }
                        }
                    }
                ]}
                onUpdateData={ this.fetchTags }
                columns={ [
                    { title: 'Name' },
                    { title: 'Value', transforms: [ cellWidth(30) ] },
                    { title: 'Tag source', transforms: [ cellWidth(30) ] }
                ] }
                {...!activeSystemTag && {
                    onSelect: (selected) => this.setState({ selected }),
                    selected,
                    onApply: () => onApply && onApply(selected)
                }}
                title={ activeSystemTag ?
                    `${activeSystemTag.display_name} (${tagsCount})` :
                    `All tags in inventory (${tagsCount})`
                }
            />
        );
    }
}

TagsModal.propTypes = {
    showTagDialog: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.node,
        value: PropTypes.node,
        namespace: PropTypes.node
    })),
    filterTagsBy: PropTypes.string,
    tagsCount: PropTypes.number,
    activeSystemTag: PropTypes.shape({
        id: PropTypes.string,
        // eslint-disable-next-line camelcase
        display_name: PropTypes.string
    }),
    pagination: PropTypes.shape({
        page: PropTypes.number,
        perPage: PropTypes.number
    }),
    loaded: PropTypes.bool,
    onToggleTagModal: PropTypes.func,
    fetchAllTags: PropTypes.func,
    onApply: PropTypes.func,
    onToggleModal: PropTypes.func,
    customFilters: PropTypes.shape({
        tags: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.arrayOf(PropTypes.string)
        ])
    })
};

TagsModal.defaultProps = {
    showTagDialog: false,
    loaded: false,
    tagsCount: 0,
    filterTagsBy: '',
    onToggleModal: () => undefined
};

export default connect(({ entities, entityDetails }) => {
    const { showTagDialog, activeFilters, activeSystemTag, allTagsTotal, allTags, allTagsPagination, allTagsLoaded } = entities || entityDetails || {};
    return ({
        showTagDialog,
        tags: activeSystemTag ? activeSystemTag.tags : allTags && allTags.reduce((acc, { tags }) => ([
            ...acc,
            ...flatten(tags.map(({ tag }) => tag))
        ]), []),
        filters: activeFilters,
        activeSystemTag,
        loaded: activeSystemTag ? activeSystemTag.tagsLoaded : allTagsLoaded,
        tagsCount: activeSystemTag ? activeSystemTag.tagsCount : allTagsTotal,
        pagination: activeSystemTag ? {
            page: activeSystemTag.page,
            perPage: activeSystemTag.perPage
        } : allTagsPagination || {
            page: 1,
            perPage: 10
        }
    });
}, (dispatch) => ({
    onToggleTagModal: () => dispatch(toggleTagModal(false)),
    fetchAllTags: (search, options) => dispatch(fetchAllTags(search, options)),
    fetchTagsForSystem: (systemId, search, options, tagsCount) => dispatch(loadTags(systemId, search, options, tagsCount))
}))(TagsModal);
