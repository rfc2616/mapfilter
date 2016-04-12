<div class="save-filter-container">
  <div class="panel panel-default">
    <div class="panel-heading">
      <button type="button" class="close pull-right" aria-hidden="true">&times;</button>
      <h3 class="panel-title"><%= t('ui.save_filter_view.title') %></h3>
    </div>
    <div class="clearfix">&nbsp;</div>
    <div class="panel-body">
      <span><strong><%= t('ui.save_filter_view.prompt_name') %>: </strong></span>
      <br/>
      <input style="width:150px;" type="text" name="name" id='filter-name'/>
      <br/>
      <br/>
      <span><strong><%= t('ui.save_filter_view.prompt_target') %>: </strong></span>
      <br/>
      <select style="width:150px;" name="target" id="filter-target">
        <% targets.forEach(function(target) { %>
          <option id="target-<%= target.value %>" data-path="<%= target.path %>" value="<%= target.value %>"><%= target.name %></option>
        <% }); %>
        <option id="target-communitylands" data-path="/filters" value="communitylands"><%= t('ui.save_filter_view.target_community_lands') %></option>
      </select>
      <br/><br/>
      <button type="button" class="btn btn-primary" id="submit-save-filter"><%= t('ui.save_filter_view.save') %></button>
      <span>&nbsp;</span>
      <button type="button" class="btn btn-default" id="cancel-save-filter"><%= t('ui.save_filter_view.cancel') %></button>
    </div>
  </div>
</div>
